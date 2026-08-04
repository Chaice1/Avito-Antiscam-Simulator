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
