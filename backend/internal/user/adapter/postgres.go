package adapter

import (
	"antiscam-simulator/internal/user/model"
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type UserRepository struct {
	pool *pgxpool.Pool
}

func NewUserRepository(pool *pgxpool.Pool) *UserRepository {
	return &UserRepository{
		pool: pool,
	}
}

func (r *UserRepository) Create(ctx context.Context, user model.User) error {
	query := `INSERT INTO users (id , username , created_at) VALUES ($1 , $2 , $3)`
	_, err := r.pool.Exec(ctx, query, user.ID, user.Username, user.CreatedAt)
	return err
}

func (r *UserRepository) SaveGame(ctx context.Context, game *model.GameSave) error {
	query := `INSERT INTO game_saves (user_id, scenario_id, scenario_description, risk_level) VALUES ($1, $2, $3, $4)`
	_, err := r.pool.Exec(ctx, query, game.UserID, game.ScenarioID, game.ScenarioDescription, game.RiskLevel)
	return err
}

func (r *UserRepository) UserExists(ctx context.Context, userID string) (bool, error) {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM users WHERE id = $1)`
	err := r.pool.QueryRow(ctx, query, userID).Scan(&exists)
	return exists, err
}

func (r *UserRepository) GetHistory(ctx context.Context, userID string) ([]model.GameHistoryItem, error) {
	exists, err := r.UserExists(ctx, userID)
	if err != nil {
		return nil, err
	}
	if !exists {
		return nil, model.ErrUserNotFound
	}

	query := `SELECT scenario_id, scenario_description, risk_level, created_at FROM game_saves WHERE user_id = $1 ORDER BY created_at DESC`
	rows, err := r.pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var history []model.GameHistoryItem
	for rows.Next() {
		var item model.GameHistoryItem
		if err := rows.Scan(&item.ScenarioID, &item.ScenarioDescription, &item.RiskLevel, &item.CreatedAt); err != nil {
			return nil, err
		}
		history = append(history, item)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	if history == nil {
		history = []model.GameHistoryItem{}
	}

	return history, nil
}
