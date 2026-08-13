package simulatorcontroller

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	simulatordomain "antiscam-simulator/internal/simulator/domain"
	simulatordto "antiscam-simulator/internal/simulator/dto"
	userdomain "antiscam-simulator/internal/user/domain"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type mockUsecase struct {
	err error
}

func (m *mockUsecase) StartGame(_ context.Context, _, _ string) (string, *simulatordomain.Node, error) {
	if m.err != nil {
		return "", nil, m.err
	}

	node := &simulatordomain.Node{Question: "Test Question"}
	return "sess_123", node, nil
}

func (m *mockUsecase) ProcessStep(_ context.Context, _, _ string) (*simulatordomain.Node, *simulatordomain.Session, error) {
	if m.err != nil {
		if errors.Is(m.err, simulatordomain.ErrGameIsOver) {
			session := &simulatordomain.Session{
				SessionID: "sess_123",
				TotalRisk: 100,
				IsOver:    true,
			}
			return &simulatordomain.Node{Question: "Game Over"}, session, m.err
		}
		return nil, nil, m.err
	}

	session := &simulatordomain.Session{
		SessionID: "sess_123",
		TotalRisk: 20,
		IsOver:    false,
	}
	node := &simulatordomain.Node{Question: "Next Question"}
	return node, session, nil
}

func (m *mockUsecase) GetScenarios() []*simulatordomain.Scenario {
	return []*simulatordomain.Scenario{
		{ScenarioID: "scen_1", Title: "Тест 1", Role: "buyer"},
	}
}

func (m *mockUsecase) GenerateScenario(_ context.Context) (string, error) {
	if m.err != nil {
		return "", m.err
	}
	return "scenario_12", nil
}

type mockLocalStorage struct{}

func (m *mockLocalStorage) GetRole(_ string) string  { return "buyer" }
func (m *mockLocalStorage) GetTitle(_ string) string { return "Test Title" }

type mockUserStorage struct{}

func (m *mockUserStorage) SaveTrainingResult(_ context.Context, _ *userdomain.TrainingResult) error {
	return nil
}

func TestStartGameHandler(t *testing.T) {
	tests := []struct {
		name           string
		requestBody    interface{}
		mockError      error
		expectedStatus int
	}{
		{
			name: "Успешный старт",
			requestBody: simulatordto.StartGameRequest{
				UserID:     "user1",
				ScenarioID: "scen1",
			},
			mockError:      nil,
			expectedStatus: http.StatusOK,
		},
		{
			name:           "Неверный JSON (Bad Request)",
			requestBody:    "invalid json string",
			mockError:      nil,
			expectedStatus: http.StatusBadRequest,
		},
		{
			name: "Сценарий не найден (404)",
			requestBody: simulatordto.StartGameRequest{
				UserID:     "user1",
				ScenarioID: "unknown",
			},
			mockError:      simulatordomain.ErrScenarioNotFound,
			expectedStatus: http.StatusNotFound,
		},
		{
			name: "Внутренняя ошибка сервера (500)",
			requestBody: simulatordto.StartGameRequest{
				UserID:     "user1",
				ScenarioID: "scen1",
			},
			mockError:      errors.New("redis died"),
			expectedStatus: http.StatusInternalServerError,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			uc := &mockUsecase{err: tt.mockError}
			ls := &mockLocalStorage{}
			sc := NewSimulatorController(uc, ls, nil)

			var body []byte
			if str, ok := tt.requestBody.(string); ok {
				body = []byte(str)
			} else {
				body, _ = json.Marshal(tt.requestBody)
			}

			req := httptest.NewRequest(http.MethodPost, "/api/v1/game/start", bytes.NewBuffer(body))
			w := httptest.NewRecorder()

			handler := sc.StartGame()
			handler.ServeHTTP(w, req)

			assert.Equal(t, tt.expectedStatus, w.Code)
		})
	}
}

func TestProcessStepHandler(t *testing.T) {
	tests := []struct {
		name           string
		requestBody    interface{}
		mockError      error
		expectedStatus int
	}{
		{
			name: "Успешный шаг (Игра продолжается)",
			requestBody: simulatordto.ProcessStepRequest{
				SessiondID: "sess_123",
				AnswerID:   "ans_1",
			},
			mockError:      nil,
			expectedStatus: http.StatusOK,
		},
		{
			name: "Игра окончена (Возвращаем 200 OK с итогами)",
			requestBody: simulatordto.ProcessStepRequest{
				SessiondID: "sess_123",
				AnswerID:   "ans_fatal",
			},
			mockError:      simulatordomain.ErrGameIsOver,
			expectedStatus: http.StatusOK,
		},
		{
			name: "Сессия протухла (410 Gone)",
			requestBody: simulatordto.ProcessStepRequest{
				SessiondID: "old_sess",
				AnswerID:   "ans_1",
			},
			mockError:      simulatordomain.ErrSessionNotFound,
			expectedStatus: http.StatusGone,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			uc := &mockUsecase{err: tt.mockError}
			ls := &mockLocalStorage{}
			us := &mockUserStorage{}
			sc := NewSimulatorController(uc, ls, us)

			body, _ := json.Marshal(tt.requestBody)
			req := httptest.NewRequest(http.MethodPost, "/api/v1/game/step", bytes.NewBuffer(body))
			w := httptest.NewRecorder()

			handler := sc.ProcessStep()
			handler.ServeHTTP(w, req)

			assert.Equal(t, tt.expectedStatus, w.Code)

			if tt.expectedStatus == http.StatusOK {
				var resp simulatordto.ProcessStepResponse
				err := json.NewDecoder(w.Body).Decode(&resp)
				require.NoError(t, err)

				if tt.mockError == simulatordomain.ErrGameIsOver {
					assert.True(t, resp.IsOver, "Ожидалось, что IsOver будет true")
				}
			}
		})
	}
}
