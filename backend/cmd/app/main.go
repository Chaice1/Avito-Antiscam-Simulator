package main

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"

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

	mux := http.NewServeMux()
	mux.HandleFunc("POST /api/v1/register", handler.Register)
	mux.HandleFunc("POST /api/v1/games", handler.SaveGame)
	mux.HandleFunc("GET /api/v1/users/{user_id}/history", handler.GetHistory)

	slog.Info("starting server", "port", port)
	if err := http.ListenAndServe(":"+port, corsMiddleware(mux)); err != nil {
		return fmt.Errorf("server stopped with error: %w", err)
	}

	return nil
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}
