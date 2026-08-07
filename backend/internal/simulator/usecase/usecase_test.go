package simulatorusecase

import (
	simulatordomain "antiscam-simulator/internal/simulator/domain"
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type mockRedis struct {
	sessions    map[string]*simulatordomain.Session
	forcedError error
}

func newMockRedis() *mockRedis {
	return &mockRedis{
		sessions: make(map[string]*simulatordomain.Session),
	}
}

func (m *mockRedis) SetSession(_ context.Context, sessionID string, s *simulatordomain.Session) error {
	if m.forcedError != nil {
		return m.forcedError
	}

	m.sessions[sessionID] = s
	return nil
}

func (m *mockRedis) GetSessionInfo(_ context.Context, sessionID string) (*simulatordomain.Session, error) {
	if m.forcedError != nil {
		return nil, m.forcedError
	}

	session, ok := m.sessions[sessionID]
	if !ok || session == nil {
		return nil, simulatordomain.ErrSessionNotFound
	}

	return session, nil
}

type mockStorage struct {
	nodes map[string]simulatordomain.Node
}

func (m *mockStorage) GetNode(scenarioID, nodeID string) (simulatordomain.Node, error) {
	targetID := nodeID
	if targetID == "" {
		targetID = scenarioID
	}

	node, ok := m.nodes[targetID]
	if !ok {
		return simulatordomain.Node{}, simulatordomain.ErrScenarioNotFound
	}
	return node, nil
}

func TestProcessStep(t *testing.T) {

	storageMock := &mockStorage{
		nodes: map[string]simulatordomain.Node{
			"node_start": simulatordomain.Node{
				Question: "Тестовый вопрос",
				Options: []simulatordomain.Option{
					{ID: "ans_safe", Risk: 0, NextNodeID: "node_2_safe"},
					{ID: "ans_risk", Risk: 40, MistakeTag: "TEST_MISTAKE", NextNodeID: "node_3_risk"},
					{ID: "ans_fatal", Risk: 100, MistakeTag: "FATAL_ERROR", NextNodeID: "node_game_over"},
					{ID: "ans_safe1", Risk: -30, NextNodeID: "node_3_safe"},
				},
			},
			"node_2_safe": {
				Question: "Следующий безопасный вопрос",
				Options:  []simulatordomain.Option{{ID: "ans_dummy", Text: "Дальше"}},
			},
			"node_3_risk": {
				Question: "Следующий опасный вопрос",
				Options:  []simulatordomain.Option{{ID: "ans_dummy", Text: "Дальше"}},
			},
			"node_game_over": {
				Question: "Вы проиграли",
				Options:  nil,
			},
			"node_3_safe": {
				Question: "Следующий безопасный вопрос",
				Options:  []simulatordomain.Option{{ID: "ans_dummy", Text: "Дальше"}},
			},
		},
	}

	tests := []struct {
		name          string
		sessionID     string
		initialRisk   int32
		answerID      string
		expectedRisk  int32
		expectedOver  bool
		expectedError error
	}{
		{
			name:         "Безопасный ответ - игра продолжается",
			initialRisk:  0,
			sessionID:    "test_session",
			answerID:     "ans_safe",
			expectedRisk: 0,
			expectedOver: false,
		},
		{
			name:         "Безопасный ответ - риск падает",
			initialRisk:  20,
			sessionID:    "test_session",
			answerID:     "ans_safe1",
			expectedRisk: 0,
			expectedOver: false,
		},
		{
			name:         "Рискованный ответ - риск растёт",
			initialRisk:  20,
			sessionID:    "test_session",
			answerID:     "ans_risk",
			expectedRisk: 60,
			expectedOver: false,
		},
		{
			name:         "Риск превышает 100 - игра заканчивается",
			initialRisk:  80,
			sessionID:    "test_session",
			answerID:     "ans_risk",
			expectedRisk: 100,
			expectedOver: true,
		},
		{
			name:         "Фатальный ответ - конец игры ",
			initialRisk:  0,
			sessionID:    "test_session",
			answerID:     "ans_fatal",
			expectedRisk: 100,
			expectedOver: true,
		},
		{
			name:          "Неверный ID ответа",
			initialRisk:   0,
			sessionID:     "test_session",
			answerID:      "unknown_ans",
			expectedError: simulatordomain.ErrUnknownAnswer,
		},
		{
			name:          "Неверный id сессии или просто истекла ",
			initialRisk:   0,
			sessionID:     "unknown_session",
			expectedError: simulatordomain.ErrSessionNotFound,
		},
	}
	redisMock := newMockRedis()

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {

			redisMock.sessions["test_session"] = &simulatordomain.Session{
				SessionID:  "test_session",
				ScenarioID: "test_scenario",
				NodeID:     "node_start",
				TotalRisk:  tt.initialRisk,
				IsOver:     false,
			}
			us := NewUsecaseSimulator(redisMock, storageMock)

			_, _, err := us.ProcessStep(context.Background(), tt.answerID, tt.sessionID)

			if tt.expectedError != nil {
				require.Error(t, err)
				assert.Equal(t, tt.expectedError, err)
				return
			}

			if err == simulatordomain.ErrGameIsOver {
				require.Error(t, err)
			} else {
				require.NoError(t, err)
			}

			assert.Equal(t, tt.expectedRisk, redisMock.sessions["test_session"].TotalRisk, "неверный подсчёт риска")

			assert.Equal(t, tt.expectedOver, redisMock.sessions["test_session"].IsOver, "Неверный статус завершения игры")
		})
	}
}

func TestStartGame(t *testing.T) {
	testNode := simulatordomain.Node{
		Question: "Первый вопрос",
		Options: []simulatordomain.Option{{
			ID:   "ans_1",
			Text: "Ответ 1",
		}},
	}

	storageMock := &mockStorage{
		nodes: map[string]simulatordomain.Node{
			"valid_scenario": testNode,
		},
	}

	tests := []struct {
		name          string
		scenarioID    string
		expectedError error
	}{
		{
			name:          "Успешный старт игры",
			scenarioID:    "valid_scenario",
			expectedError: nil,
		},
		{
			name:          "Сценарий не найден",
			scenarioID:    "unknown_scenario",
			expectedError: simulatordomain.ErrScenarioNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			redisMock := newMockRedis()

			us := NewUsecaseSimulator(redisMock, storageMock)

			sessionID, node, err := us.StartGame(context.Background(), "user_123", tt.scenarioID)

			if tt.expectedError != nil {
				require.Error(t, err)
				assert.Equal(t, tt.expectedError, err)
				assert.Empty(t, sessionID)
				assert.Nil(t, node)
				return
			}

			require.NoError(t, err)

			assert.NotEmpty(t, sessionID, "SessionID должен быть сгенерирован")
			assert.NotNil(t, node, "Должен вернуться первый узел")
			assert.Equal(t, "Первый вопрос", node.Question)

			require.NotNil(t, redisMock.sessions[sessionID], "Сессия должна быть сохранена в Redis")
			assert.Equal(t, tt.scenarioID, redisMock.sessions[sessionID].ScenarioID)
			assert.Equal(t, int32(0), redisMock.sessions[sessionID].TotalRisk, "Стартовый риск должен быть 0")
			assert.False(t, redisMock.sessions[sessionID].IsOver, "Игра не должна быть окончена на старте")
		})
	}
}
