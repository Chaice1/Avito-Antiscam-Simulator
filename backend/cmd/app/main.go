package main

import (
	"context"
	"fmt"
	"log/slog"
	"os"

	"antiscam-simulator/internal/transport/rest"
	"antiscam-simulator/internal/user/adapter"
	"antiscam-simulator/internal/user/controller"
	"antiscam-simulator/internal/user/service"
	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	if err := run(); err != nil {
		slog.Error("application startup failed", "error", err)
		os.Exit(1)
	}
}

func run() error {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	connStr := os.Getenv("DB_CONN_STR")
	if connStr == "" {
		connStr = "postgres://antiscam_user:antiscam_password@localhost:5432/antiscam_db?sslmode=disable"
	}

	ctx := context.Background()
	pool, err := pgxpool.New(ctx, connStr)
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	repo := adapter.NewUserRepository(pool)
	svc := service.NewUserService(repo)
	handler := controller.NewUserHandler(svc)

	server := rest.NewServer(port, handler)

	return server.Run(ctx)
}
