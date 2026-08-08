package userdomain

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

type Tag struct {
	Question    string `json:"question"`
	Answer      string `json:"answer"`
	Explanation string `json:"explanation"`
}

type TrainingResult struct {
	ID         string    `json:"id,omitempty" db:"id"`
	UserID     string    `json:"user_id" db:"user_id"`
	ScenarioID string    `json:"scenario_id" db:"scenario_id"`
	TotalRisk  int32     `json:"total_risk" db:"total_risk"`
	FinalGrade string    `json:"final_grade" db:"final_grade"`
	Tags       []Tag     `json:"tags" db:"tags"`
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
}

type TrainingHistoryItem struct {
	ScenarioID string    `json:"scenario_id" db:"scenario_id"`
	TotalRisk  int32     `json:"total_risk" db:"total_risk"`
	FinalGrade string    `json:"final_grade" db:"final_grade"`
	Tags       []Tag     `json:"tags" db:"tags"`
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
}

type UserHistoryResponse struct {
	UserID  string                `json:"user_id"`
	History []TrainingHistoryItem `json:"history"`
}
