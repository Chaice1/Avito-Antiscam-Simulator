package rest

import (
	simulatorcontroller "antiscam-simulator/internal/simulator/controller/http"
	"net/http"
)

func AddRoutes(sc *simulatorcontroller.SimulatorController) *http.ServeMux {

	mux := http.NewServeMux()
	mux.HandleFunc("POST /api/v1/game/start", sc.StartGame())
	mux.HandleFunc("POST /api/v1/game/step", sc.ProcessStep())
	mux.HandleFunc("GET /api/v1/scenarios", sc.GetScenarios())

	return mux
}
