package simulatorusecase

import (
	redisdb "antiscam-simulator/internal/simulator/adapter/redis"
	simulatordomain "antiscam-simulator/internal/simulator/domain"
	"context"
	"log/slog"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/testcontainers/testcontainers-go/modules/redis"
)

func TestIntegration_StartAndProcess(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}
	ctx := context.Background()

	redisContainer, err := redis.Run(ctx, "redis:7-alpine")

	require.NoError(t, err)

	defer func() {
		errTerminate := redisContainer.Terminate(ctx)
		if err != nil {
			slog.Error("failed to stop and remove container", "error", errTerminate)
		}
	}()

	redisAddr, err := redisContainer.ConnectionString(ctx)
	if err != nil {
		slog.Error("failed to get connection string", "error", err)
		return
	}

	redisDB := redisdb.NewRedisDB(int64(15), redisAddr)
	storageMock := &mockStorage{
		nodes: map[string]simulatordomain.Node{
			"test_scenario": {
				Question: "Тестовый старт",
				Options: []simulatordomain.Option{
					{ID: "ans_1", Risk: 20, NextNodeID: "node_next"},
				},
			},
			"node_next": {
				Question: "Следующий вопрос",
				Options:  []simulatordomain.Option{},
			},
		},
	}

	mockLLM := &mockClientLLM{}

	us := NewUsecaseSimulator(redisDB, storageMock, mockLLM)

	sessionID, firstNode, err := us.StartGame(ctx, "user", "test_scenario")
	require.NoError(t, err)
	assert.NotEmpty(t, sessionID)
	assert.NotNil(t, firstNode)

	savedSession, err := redisDB.GetSessionInfo(ctx, sessionID)
	require.NoError(t, err)
	assert.Equal(t, int32(0), savedSession.TotalRisk)

	_, updatedSession, err := us.ProcessStep(ctx, "ans_1", sessionID)

	if err != simulatordomain.ErrGameIsOver {
		require.NoError(t, err)
	}
	assert.NotNil(t, updatedSession)

	finalSession, err := redisDB.GetSessionInfo(ctx, sessionID)
	require.NoError(t, err)
	assert.Equal(t, int32(20), finalSession.TotalRisk)

}
