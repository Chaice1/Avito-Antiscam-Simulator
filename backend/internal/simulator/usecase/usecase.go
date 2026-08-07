package simulatorusecase

import (
	simulatordomain "antiscam-simulator/internal/simulator/domain"
	"context"
	"errors"

	"github.com/google/uuid"
)

type Redis interface {
	SetSession(context.Context, string, *simulatordomain.Session) error
	GetSessionInfo(context.Context, string) (*simulatordomain.Session, error)
}

type StorageGraphScenarios interface {
	GetNode(string, string) (simulatordomain.Node, error)
}

type UsecaseSimulator struct {
	r Redis
	s StorageGraphScenarios
}

func NewUsecaseSimulator(r Redis, s StorageGraphScenarios) *UsecaseSimulator {
	return &UsecaseSimulator{
		r: r,
		s: s,
	}
}

func (us *UsecaseSimulator) StartGame(ctx context.Context, userID, scenarioID string) (string, *simulatordomain.Node, error) {

	nodeID, err := us.s.GetNode(scenarioID, "")
	if err != nil {
		return "", nil, simulatordomain.ErrScenarioNotFound
	}
	var risk int32

	sessionID := uuid.New()

	session := simulatordomain.Session{
		SessionID:       sessionID.String(),
		ScenarioID:      scenarioID,
		UserID:          userID,
		IsOver:          false,
		TotalRisk:       risk,
		NodeID:          "",
		CurrentMistakes: []simulatordomain.Mistake{},
	}

	err = us.r.SetSession(ctx, sessionID.String(), &session)

	if err != nil {
		return "", nil, err
	}

	return sessionID.String(), &nodeID, nil
}
func (us *UsecaseSimulator) ProcessStep(ctx context.Context, answerID, sessionID string) (*simulatordomain.Node, *simulatordomain.Session, error) {

	session, err := us.r.GetSessionInfo(ctx, sessionID)
	if err != nil {
		if errors.Is(err, simulatordomain.ErrSessionNotFound) {
			return nil, nil, simulatordomain.ErrSessionNotFound
		}
		return nil, nil, err
	}

	currentNode, err := us.s.GetNode(session.ScenarioID, session.NodeID)

	if err != nil {
		return nil, nil, err
	}

	if session.IsOver {
		return &currentNode, session, simulatordomain.ErrGameIsOver
	}

	var option *simulatordomain.Option

	for _, opt := range currentNode.Options {
		if answerID == opt.ID {
			option = &opt
			break
		}
	}

	if option == nil {
		return &currentNode, session, simulatordomain.ErrUnknownAnswer
	}

	if option.Risk > 0 {
		session.CurrentMistakes = append(session.CurrentMistakes, simulatordomain.Mistake{
			Question:   currentNode.Question,
			Answer:     option.Text,
			MistakeTag: option.MistakeTag,
		})
	}

	session.TotalRisk += option.Risk

	session.NodeID = option.NextNodeID

	nextNode, err := us.s.GetNode(session.ScenarioID, session.NodeID)

	if err != nil {
		return nil, nil, err
	}

	switch {
	case session.TotalRisk < 0:
		session.TotalRisk = 0
	case session.TotalRisk >= 100:
		session.TotalRisk = 100
		session.IsOver = true
	}

	if len(nextNode.Options) == 0 {
		session.IsOver = true
	}

	err = us.r.SetSession(ctx, sessionID, session)

	if err != nil {
		return nil, nil, err
	}

	if session.IsOver {
		return &nextNode, session, simulatordomain.ErrGameIsOver
	}

	return &nextNode, session, nil
}
