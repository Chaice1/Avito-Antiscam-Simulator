package service_test

import (
	"antiscam-simulator/internal/user/model"
	"antiscam-simulator/internal/user/service"
	"context"
	"errors"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

type mockUserRepository struct {
	createFunc     func(ctx context.Context, user model.User) error
	saveGameFunc   func(ctx context.Context, game *model.GameSave) error
	getHistoryFunc func(ctx context.Context, userID string) ([]model.GameHistoryItem, error)
}

func (m *mockUserRepository) Create(ctx context.Context, user model.User) error {
	return m.createFunc(ctx, user)
}

func (m *mockUserRepository) SaveGame(ctx context.Context, game *model.GameSave) error {
	return m.saveGameFunc(ctx, game)
}

func (m *mockUserRepository) GetHistory(ctx context.Context, userID string) ([]model.GameHistoryItem, error) {
	return m.getHistoryFunc(ctx, userID)
}

func TestUserService_Register(t *testing.T) {
	tests := []struct {
		name        string
		username    string
		mockCreate  func(ctx context.Context, user model.User) error
		expectError bool
	}{
		{
			name:     "success",
			username: "testuser",
			mockCreate: func(_ context.Context, user model.User) error {
				assert.NotEmpty(t, user.ID)
				assert.Equal(t, "testuser", user.Username)
				assert.WithinDuration(t, time.Now(), user.CreatedAt, 2*time.Second)
				return nil
			},
			expectError: false,
		},
		{
			name:     "db error",
			username: "duplicate",
			mockCreate: func(_ context.Context, _ model.User) error {
				return errors.New("unique violation")
			},
			expectError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			repo := &mockUserRepository{createFunc: tt.mockCreate}
			svc := service.NewUserService(repo)

			userID, err := svc.Register(context.Background(), tt.username)

			if tt.expectError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.NotEmpty(t, userID)
			}
		})
	}
}

func TestUserService_GetHistory(t *testing.T) {
	tests := []struct {
		name        string
		userID      string
		mockHistory func(ctx context.Context, userID string) ([]model.GameHistoryItem, error)
		wantLen     int
		expectError bool
	}{
		{
			name:   "success with items",
			userID: "123",
			mockHistory: func(_ context.Context, _ string) ([]model.GameHistoryItem, error) {
				return []model.GameHistoryItem{{ScenarioID: "scen1"}}, nil
			},
			wantLen:     1,
			expectError: false,
		},
		{
			name:   "user not found",
			userID: "404",
			mockHistory: func(_ context.Context, _ string) ([]model.GameHistoryItem, error) {
				return nil, model.ErrUserNotFound
			},
			wantLen:     0,
			expectError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			repo := &mockUserRepository{getHistoryFunc: tt.mockHistory}
			svc := service.NewUserService(repo)

			history, err := svc.GetHistory(context.Background(), tt.userID)

			if tt.expectError {
				assert.ErrorIs(t, err, model.ErrUserNotFound)
			} else {
				assert.NoError(t, err)
				assert.Len(t, history, tt.wantLen)
			}
		})
	}
}
