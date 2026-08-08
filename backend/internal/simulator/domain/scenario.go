package simulatordomain

type Session struct {
	SessionID  string
	ScenarioID string
	IsOver     bool
	UserID     string
	TotalRisk  int32
	NodeID     string
	Tags       []Tag
}

type Tag struct {
	Question string
	Answer   string
	TagID    string
}

type Graph struct {
	Scenario    Scenario
	StartNodeID string
	Nodes       map[string]Node
}

type Scenario struct {
	Title      string
	Role       string
	ScenarioID string
}

type Node struct {
	Question string
	Options  []Option
}

type Option struct {
	ID         string
	Text       string
	Risk       int32
	TagID      string
	NextNodeID string
}
