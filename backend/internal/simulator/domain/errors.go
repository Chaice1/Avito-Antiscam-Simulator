package simulatordomain

import "errors"

var (
	ErrScenarioNotFound     = errors.New("current scenario not found")
	ErrInternalStorage      = errors.New("internal storage error")
	ErrScenariosNotFound    = errors.New("scenarios not found ")
	ErrGameIsOver           = errors.New("game is over")
	ErrUnknownAnswer        = errors.New("unknown answer")
	ErrSessionNotFound      = errors.New("current session not found")
	ErrServiceIsUnavailable = errors.New("service is unavailable")
	ErrEmptyAiResponse      = errors.New("empty response from ai")
	ErrAPIAi                = errors.New("error api ai")
)
