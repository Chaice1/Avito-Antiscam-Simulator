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
