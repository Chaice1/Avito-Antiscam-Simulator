package main

// application1
import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"os/signal"

	"antiscam-simulator/config"
	llmclient "antiscam-simulator/internal/simulator/adapter/LLmClient"
	localstorage "antiscam-simulator/internal/simulator/adapter/localStorage"
	redisDB "antiscam-simulator/internal/simulator/adapter/redis"
	simulatorController "antiscam-simulator/internal/simulator/controller/http"
	simulatorUsecase "antiscam-simulator/internal/simulator/usecase"
	"antiscam-simulator/internal/transport/rest"
	"antiscam-simulator/internal/user/adapter/postgres"
	usercontroller "antiscam-simulator/internal/user/controller/http"
	userusecase "antiscam-simulator/internal/user/usecase"

	"github.com/jackc/pgx/v5/pgxpool"
)

func runApp() error {
	cfg := config.MustLoad()

	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, os.Kill)
	defer cancel()

	pool, err := pgxpool.New(ctx, cfg.Database.DSN)
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}
	defer pool.Close()

	err = pool.Ping(ctx)
	if err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	redis := redisDB.NewRedisDB(int64(cfg.Cache.TTL), cfg.Redis.Address)

	storageScenarios, err := localstorage.NewStorageGraphOfScenarios([]string{
		"scenarios/buyer_iphone.json",
		"scenarios/seller_card.json",
		"scenarios/seller_gpu.json",
		"scenarios/tenant_flat.json",
	})
	if err != nil {
		return fmt.Errorf("failed to load scenarios: %w", err)
	}

	userRepo := postgres.NewUserRepository(pool)

	clientLLM := llmclient.NewClientLLM(cfg.LLM.Key, cfg.LLM.FolderID)
	simUsecase := simulatorUsecase.NewUsecaseSimulator(redis, storageScenarios, clientLLM)
	userSvc := userusecase.NewUsecaseUser(userRepo)

	simCtrl := simulatorController.NewSimulatorController(simUsecase, storageScenarios, userRepo)
	userCtrl := usercontroller.NewUserController(userSvc)

	server := rest.NewServer(cfg.HTTP.Address, userCtrl, simCtrl)

	slog.Info("Starting server on", "address", cfg.HTTP.Address)
	if err := server.Run(ctx); err != nil {
		return fmt.Errorf("server shutdown error: %w", err)
	}

	slog.Info("server stopped gracefully")
	return nil
}

func main() {
	if err := runApp(); err != nil {
		slog.Error("application startup failed", "error", err)
		os.Exit(1)
	}
}
