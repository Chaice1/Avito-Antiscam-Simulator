package simulatordomain

import "errors"

var (
	ErrScenarioNotFound  = errors.New("current scenario not found")
	ErrInternalStorage   = errors.New("internal storage error")
	ErrScenariosNotFound = errors.New("scenarios not found ")
	ErrGameIsOver        = errors.New("Game is over")
	ErrUnknownAnswer     = errors.New("Unknown answer")
	ErrSessionNotFound   = errors.New("current session not found")
)
