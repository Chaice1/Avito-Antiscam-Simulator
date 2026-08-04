package controller_test

import (
	"antiscam-simulator/internal/user/controller"
	"antiscam-simulator/internal/user/model"
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
)

type mockUserServicer struct {
	registerFunc   func(ctx context.Context, username string) (string, error)
	saveGameFunc   func(ctx context.Context, game *model.GameSave) error
	getHistoryFunc func(ctx context.Context, userID string) ([]model.GameHistoryItem, error)
}

func (m *mockUserServicer) Register(ctx context.Context, username string) (string, error) {
	return m.registerFunc(ctx, username)
}

func (m *mockUserServicer) SaveGame(ctx context.Context, game *model.GameSave) error {
	return m.saveGameFunc(ctx, game)
}

func (m *mockUserServicer) GetHistory(ctx context.Context, userID string) ([]model.GameHistoryItem, error) {
	return m.getHistoryFunc(ctx, userID)
}

func TestUserHandler_Register(t *testing.T) {
	tests := []struct {
		name         string
		payload      map[string]interface{}
		mockRegister func(ctx context.Context, username string) (string, error)
		expectedCode int
	}{
		{
			name:    "success",
			payload: map[string]interface{}{"username": "testuser"},
			mockRegister: func(_ context.Context, _ string) (string, error) {
				return "uuid-123", nil
			},
			expectedCode: http.StatusCreated,
		},
		{
			name:         "empty username",
			payload:      map[string]interface{}{"username": ""},
			mockRegister: nil,
			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "invalid json",
			payload:      nil,
			mockRegister: nil,
			expectedCode: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			svc := &mockUserServicer{registerFunc: tt.mockRegister}
			handler := controller.NewUserHandler(svc)

			var body []byte
			if tt.payload != nil {
				body, _ = json.Marshal(tt.payload)
			}
			req := httptest.NewRequest(http.MethodPost, "/api/v1/register", bytes.NewBuffer(body))
			w := httptest.NewRecorder()

			handler.Register(w, req)

			assert.Equal(t, tt.expectedCode, w.Code)
		})
	}
}

func TestUserHandler_GetHistory(t *testing.T) {
	tests := []struct {
		name        string
		pathUserID  string
		mockHistory func(ctx context.Context, userID string) ([]model.GameHistoryItem, error)
		expectCode  int
	}{
		{
			name:       "success",
			pathUserID: "123",
			mockHistory: func(_ context.Context, _ string) ([]model.GameHistoryItem, error) {
				return []model.GameHistoryItem{{ScenarioID: "scen1"}}, nil
			},
			expectCode: http.StatusOK,
		},
		{
			name:       "user not found",
			pathUserID: "404",
			mockHistory: func(_ context.Context, _ string) ([]model.GameHistoryItem, error) {
				return nil, model.ErrUserNotFound
			},
			expectCode: http.StatusNotFound,
		},
		{
			name:        "empty path value",
			pathUserID:  "",
			mockHistory: nil,
			expectCode:  http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			svc := &mockUserServicer{getHistoryFunc: tt.mockHistory}
			handler := controller.NewUserHandler(svc)

			req := httptest.NewRequest(http.MethodGet, "/api/v1/users/"+tt.pathUserID+"/history", http.NoBody)
			if tt.pathUserID != "" {
				req.SetPathValue("user_id", tt.pathUserID)
			}

			w := httptest.NewRecorder()

			handler.GetHistory(w, req)

			assert.Equal(t, tt.expectCode, w.Code)
		})
	}
}
