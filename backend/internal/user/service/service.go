package service

import (
	"context"
	"time"

	"antiscam-simulator/internal/user/model"
	"github.com/google/uuid"
)

type UserRepository interface {
	Create(ctx context.Context, user model.User) error
	SaveGame(ctx context.Context, game *model.GameSave) error
}

type UserService struct {
	repo UserRepository
}

func NewUserService(repo UserRepository) *UserService {
	return &UserService{repo: repo}
}

func (s *UserService) Register(ctx context.Context, username string) (string, error) {
	userID := uuid.New().String()
	user := model.User{
		ID:        userID,
		Username:  username,
		CreatedAt: time.Now(),
	}

	err := s.repo.Create(ctx, user)
	if err != nil {
		return "", err
	}

	return userID, nil
}

func (s *UserService) SaveGame(ctx context.Context, game *model.GameSave) error {
	return s.repo.SaveGame(ctx, game)
}
