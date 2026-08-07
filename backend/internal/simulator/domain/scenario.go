package simulatordomain

type Session struct {
	SessionID       string
	ScenarioID      string
	IsOver          bool
	UserID          string
	TotalRisk       int32
	NodeID          string
	CurrentMistakes []Mistake
}

type Mistake struct {
	Question   string
	Answer     string
	MistakeTag string
}

type Graph struct {
	ScenarioID  string
	Title       string
	Role        string
	StartNodeID string
	Nodes       map[string]Node
}

type Node struct {
	Question string
	Options  []Option
}

type Option struct {
	ID         string
	Text       string
	Risk       int32
	MistakeTag string
	NextNodeID string
}
