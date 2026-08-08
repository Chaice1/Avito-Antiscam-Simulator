package localstorage

import (
	simulatordomain "antiscam-simulator/internal/simulator/domain"
	simulatordto "antiscam-simulator/internal/simulator/dto"
	"encoding/json"
	"log/slog"
	"os"
)

type StorageGraphScenarios struct {
	GraphsOfScenarios map[string]*simulatordomain.Graph
}

func NewStorageGraphOfScenarios(paths []string) (*StorageGraphScenarios, error) {

	ScenariosGraphs := make(map[string]*simulatordomain.Graph, len(paths))

	for i := range paths {
		func(path string) {
			file, err := os.Open(path)
			if err != nil {
				slog.Error("failed to open file", "error", err)
				return
			}
			defer func() {
				err := file.Close()
				if err != nil {
					slog.Error("failed to close file", "error", err)
				}
			}()

			var graph simulatordto.Graph
			if err := json.NewDecoder(file).Decode(&graph); err != nil {
				slog.Error("failed to parse file", "error", err)
				return
			}

			domainGraph := graph.MapDtoToDomain()
			ScenariosGraphs[domainGraph.Scenario.ScenarioID] = domainGraph
		}(paths[i])

	}

	if len(ScenariosGraphs) == 0 {
		return nil, simulatordomain.ErrScenariosNotFound
	}

	return &StorageGraphScenarios{
		GraphsOfScenarios: ScenariosGraphs,
	}, nil

}

func (sg *StorageGraphScenarios) GetTitle(scenarioID string) string {
	return sg.GraphsOfScenarios[scenarioID].Scenario.Title
}

func (sg *StorageGraphScenarios) GetRole(scenarioID string) string {
	return sg.GraphsOfScenarios[scenarioID].Scenario.Role
}

func (sg *StorageGraphScenarios) GetNode(scenarioID, nodeID string) (simulatordomain.Node, error) {
	if nodeID == "" {
		if graph, ok := sg.GraphsOfScenarios[scenarioID]; ok {
			return sg.GraphsOfScenarios[scenarioID].Nodes[graph.StartNodeID], nil
		}

		return simulatordomain.Node{}, simulatordomain.ErrScenarioNotFound
	}
	return sg.GraphsOfScenarios[scenarioID].Nodes[nodeID], nil
}

func (sg *StorageGraphScenarios) GetScenarios() []*simulatordomain.Scenario {

	scenarios := make([]*simulatordomain.Scenario, 0, len(sg.GraphsOfScenarios))
	for _, graph := range sg.GraphsOfScenarios {
		scenarios = append(scenarios, &simulatordomain.Scenario{
			Title:      graph.Scenario.Title,
			Role:       graph.Scenario.Role,
			ScenarioID: graph.Scenario.ScenarioID,
		})
	}

	return scenarios

}
