package main

//application1
import (
	"antiscam-simulator/config"
	localstorage "antiscam-simulator/internal/simulator/adapter/localStorage"
	redisDB "antiscam-simulator/internal/simulator/adapter/redis"
	simulatorController "antiscam-simulator/internal/simulator/controller/http"
	simulatorUsecase "antiscam-simulator/internal/simulator/usecase"
	"antiscam-simulator/internal/transport/rest"
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"time"
)

func runApp() {

	cfg := config.MustLoad()

	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, os.Kill)
	defer cancel()

	redis := redisDB.NewRedisDB(int64(cfg.Cache.TTL), cfg.Redis.Address)

	storageScenarios, err := localstorage.NewStorageGraphOfScenarios([]string{
		"scenarios/buyer_iphone.json",
		"scenarios/seller_card.json",
		"scenarios/seller_gpu.json",
		"scenarios/tenant_flat.json",
	})

	if err != nil {
		slog.Error("failed to load scenarios", "error", err)
		return
	}

	SimulatorUsecase := simulatorUsecase.NewUsecaseSimulator(redis, storageScenarios)

	simulatorController := simulatorController.NewSimulatorController(SimulatorUsecase, storageScenarios)

	mux := rest.AddRoutes(simulatorController)

	httpSrv := &http.Server{
		Addr:    cfg.HTTP.Address,
		Handler: mux,
	}
	go func() {

		if err := httpSrv.ListenAndServe(); err != nil {
			slog.Error("failed to listen http port", "error", err)
			return
		}
	}()

	<-ctx.Done()

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutdownCancel()

	if err := httpSrv.Shutdown(shutdownCtx); err != nil {
		slog.Error("server shutdown failed", "error", err)
		return
	}

	slog.Info("server stopped gracefully")
}
func main() {
	runApp()
}
