package model

import (
	"errors"
	"time"
)

var ErrUserNotFound = errors.New("user not found")

type User struct {
	ID        string    `json:"id" db:"id"`
	Username  string    `json:"username" db:"username"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

type GameSave struct {
	ID                  string    `json:"id,omitempty" db:"id"`
	UserID              string    `json:"user_id" db:"user_id"`
	ScenarioID          string    `json:"scenario_id" db:"scenario_id"`
	ScenarioDescription string    `json:"scenario_description" db:"scenario_description"`
	RiskLevel           string    `json:"risk_level" db:"risk_level"`
	CreatedAt           time.Time `json:"created_at" db:"created_at"`
}

type GameHistoryItem struct {
	ScenarioID          string    `json:"scenario_id" db:"scenario_id"`
	ScenarioDescription string    `json:"scenario_description" db:"scenario_description"`
	RiskLevel           string    `json:"risk_level" db:"risk_level"`
	CreatedAt           time.Time `json:"created_at" db:"created_at"`
}

type UserHistoryResponse struct {
	UserID  string            `json:"user_id"`
	History []GameHistoryItem `json:"history"`
}
