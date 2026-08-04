package controller

import (
	"context"
	"encoding/json"
	"net/http"

	"antiscam-simulator/internal/user/model"
)

type UserServicer interface {
	Register(ctx context.Context, username string) (string, error)
	SaveGame(ctx context.Context, game *model.GameSave) error
}

type UserHandler struct {
	service UserServicer
}

func NewUserHandler(service UserServicer) *UserHandler {
	return &UserHandler{service: service}
}

type RegisterRequest struct {
	Username string `json:"username"`
}

type RegisterResponse struct {
	UserID string `json:"user_id"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

func (h *UserHandler) Register(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		h.writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Username == "" {
		h.writeError(w, http.StatusBadRequest, "username is required")
		return
	}

	userID, err := h.service.Register(r.Context(), req.Username)
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, "failed to register user")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(RegisterResponse{UserID: userID})
}

func (h *UserHandler) SaveGame(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		h.writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	var req model.GameSave
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.UserID == "" {
		h.writeError(w, http.StatusBadRequest, "user_id is required")
		return
	}
	if req.ScenarioID == "" {
		h.writeError(w, http.StatusBadRequest, "scenario_id is required")
		return
	}
	if req.ScenarioDescription == "" {
		h.writeError(w, http.StatusBadRequest, "scenario_description is required")
		return
	}
	if req.RiskLevel == "" {
		h.writeError(w, http.StatusBadRequest, "risk_level is required")
		return
	}

	err := h.service.SaveGame(r.Context(), &req)
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, "failed to save game results")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(map[string]string{
		"status":  "success",
		"message": "game history saved successfully",
	})
}

func (h *UserHandler) writeError(w http.ResponseWriter, status int, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(ErrorResponse{Error: msg})
}
