package simulatordto

import simulatordomain "antiscam-simulator/internal/simulator/domain"

type StartGameRequest struct {
	ScenarioID string `json:"scenario_id"`
	UserID     string `json:"user_id"`
}

type StartGameResponse struct {
	SessionID string      `json:"session_id"`
	Title     string      `json:"title"`
	Role      string      `json:"role"`
	Risk      int32       `json:"risk"`
	Question  string      `json:"question"`
	Options   []OptionDto `json:"options"`
}

type Scenario struct {
	ScenarioID string `json:"scenario_id"`
	Title      string `json:"title"`
	Role       string `json:"role"`
}

type ProcessStepRequest struct {
	SessiondID string `json:"session_id"`
	AnswerID   string `json:"answer_id"`
}

type ProcessStepResponse struct {
	SessionID  string      `json:"session_id"`
	Risk       int32       `json:"risk"`
	FinalGrade string      `json:"final_grade,omitempty"`
	Mistakes   []Tag       `json:"mistakes,omitempty"`
	Insights   []Tag       `json:"insights,omitempty"`
	IsOver     bool        `json:"is_over"`
	Question   string      `json:"question,omitempty"`
	Options    []OptionDto `json:"options,omitempty"`
}

type GetScenariosResponse struct {
	Scenarios []*Scenario `json:"scenarios"`
}

type GenerateScenarioResponse struct {
	ScenarioID string `json:"scenario_id"`
}

type Tag struct {
	Question    string `json:"question"`
	Answer      string `json:"answer"`
	Explanation string `json:"explanation"`
}

type OptionDto struct {
	ID   string `json:"id"`
	Text string `json:"text"`
}

type Graph struct {
	Scenario    Scenario        `json:"scenario"`
	StartNodeID string          `json:"start_node_id"`
	Nodes       map[string]Node `json:"nodes"`
}

type Node struct {
	Question string   `json:"question"`
	Options  []Option `json:"options"`
}

type Option struct {
	ID         string `json:"id"`
	Text       string `json:"text"`
	Risk       int32  `json:"risk"`
	TagID      string `json:"tag_id"`
	NextNodeID string `json:"next_node_id"`
}

func (g *Graph) MapDtoToDomain() *simulatordomain.Graph {

	nodes := make(map[string]simulatordomain.Node)
	for id, node := range g.Nodes {
		domainOptions := make([]simulatordomain.Option, 0, len(node.Options))
		for _, option := range node.Options {
			domainOptions = append(domainOptions, simulatordomain.Option{
				ID:         option.ID,
				Text:       option.Text,
				Risk:       option.Risk,
				TagID:      option.TagID,
				NextNodeID: option.NextNodeID,
			})
		}
		nodes[id] = simulatordomain.Node{
			Question: node.Question,
			Options:  domainOptions,
		}
	}

	return &simulatordomain.Graph{
		Scenario: simulatordomain.Scenario{
			Title:      g.Scenario.Title,
			Role:       g.Scenario.Role,
			ScenarioID: g.Scenario.ScenarioID,
		},
		StartNodeID: g.StartNodeID,
		Nodes:       nodes,
	}
}
