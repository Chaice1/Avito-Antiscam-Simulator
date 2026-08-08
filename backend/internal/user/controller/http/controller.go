package usercontroller

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"

	"antiscam-simulator/internal/user/domain"
)

type UserUsecase interface {
	Register(ctx context.Context, username string) (string, error)
	SaveTrainingResult(ctx context.Context, result *userdomain.TrainingResult) error
	GetHistory(ctx context.Context, userID string) ([]userdomain.TrainingHistoryItem, error)
}

type UserController struct {
	usecase UserUsecase
}

func NewUserController(usecase UserUsecase) *UserController {
	return &UserController{usecase: usecase}
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

func (c *UserController) Register(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		c.writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		c.writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Username == "" {
		c.writeError(w, http.StatusBadRequest, "username is required")
		return
	}

	userID, err := c.usecase.Register(r.Context(), req.Username)
	if err != nil {
		c.writeError(w, http.StatusInternalServerError, "failed to register user")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(RegisterResponse{UserID: userID})
}

func (c *UserController) SaveTrainingResult(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		c.writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	var req userdomain.TrainingResult
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		c.writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.UserID == "" {
		c.writeError(w, http.StatusBadRequest, "user_id is required")
		return
	}
	if req.ScenarioID == "" {
		c.writeError(w, http.StatusBadRequest, "scenario_id is required")
		return
	}
	if req.FinalGrade == "" {
		c.writeError(w, http.StatusBadRequest, "final_grade is required")
		return
	}

	err := c.usecase.SaveTrainingResult(r.Context(), &req)
	if err != nil {
		c.writeError(w, http.StatusInternalServerError, "failed to save training results")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(map[string]string{
		"status":  "success",
		"message": "training result saved successfully",
	})
}

func (c *UserController) GetHistory(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		c.writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	userID := r.PathValue("user_id")
	if userID == "" {
		c.writeError(w, http.StatusBadRequest, "user_id is required")
		return
	}

	history, err := c.usecase.GetHistory(r.Context(), userID)
	if err != nil {
		if errors.Is(err, userdomain.ErrUserNotFound) {
			c.writeError(w, http.StatusNotFound, "user not found")
			return
		}
		c.writeError(w, http.StatusInternalServerError, "failed to get user statistics")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(userdomain.UserHistoryResponse{
		UserID:  userID,
		History: history,
	})
}

func (c *UserController) writeError(w http.ResponseWriter, status int, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(ErrorResponse{Error: msg})
}
