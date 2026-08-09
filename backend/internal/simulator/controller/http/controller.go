package simulatorcontroller

import (
	simulatordomain "antiscam-simulator/internal/simulator/domain"
	simulatordto "antiscam-simulator/internal/simulator/dto"
	userdomain "antiscam-simulator/internal/user/domain"
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"strings"
)

type SimulatorUsecase interface {
	StartGame(context.Context, string, string) (string, *simulatordomain.Node, error)
	ProcessStep(context.Context, string, string) (*simulatordomain.Node, *simulatordomain.Session, error)
	GetScenarios() []*simulatordomain.Scenario
	GenerateScenario(context.Context) (string, error)
}

type UserStorage interface {
	SaveTrainingResult(context.Context, *userdomain.TrainingResult) error
}
type LocalStorage interface {
	GetRole(string) string
	GetTitle(string) string
}

type SimulatorController struct {
	su SimulatorUsecase
	ls LocalStorage
	us UserStorage
}

func NewSimulatorController(su SimulatorUsecase, ls LocalStorage, us UserStorage) *SimulatorController {
	return &SimulatorController{
		su: su,
		ls: ls,
		us: us,
	}
}

func (sc *SimulatorController) StartGame() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		var req simulatordto.StartGameRequest

		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeError(w, http.StatusBadRequest, err.Error(), "Неправильный формат запроса")
			return
		}

		sessionID, node, err := sc.su.StartGame(r.Context(), req.UserID, req.ScenarioID)
		if err != nil {
			if errors.Is(err, simulatordomain.ErrScenarioNotFound) {
				writeError(w, http.StatusNotFound, err.Error(), "Такого сценария нет")
				return
			}
			writeError(w, http.StatusInternalServerError, err.Error(), "Ошибка на сервере, попробуйте ещё раз")
			return
		}

		options := []simulatordto.OptionDto{}

		for _, option := range node.Options {
			options = append(options, simulatordto.OptionDto{
				ID:   option.ID,
				Text: option.Text,
			})
		}

		title := sc.ls.GetTitle(req.ScenarioID)
		role := sc.ls.GetRole(req.ScenarioID)

		resp := simulatordto.StartGameResponse{
			Title:     title,
			SessionID: sessionID,
			Role:      role,
			Risk:      0,
			Question:  node.Question,
			Options:   options,
		}

		writeJSON(w, http.StatusOK, resp)

	}
}

func (sc *SimulatorController) ProcessStep() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		var req simulatordto.ProcessStepRequest

		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeError(w, http.StatusBadRequest, err.Error(), "Неправильный формат запроса")
			return
		}

		node, session, err := sc.su.ProcessStep(r.Context(), req.AnswerID, req.SessiondID)
		if err != nil {
			switch {
			case errors.Is(err, simulatordomain.ErrGameIsOver):

				var resp simulatordto.ProcessStepResponse

				var FinalGrade string

				switch {
				case session.TotalRisk == 0:
					FinalGrade = "Эксперт по безопасности"
				case session.TotalRisk < 50:
					FinalGrade = "Осторожный пользователь"
				case session.TotalRisk < 100:
					FinalGrade = "Доверчивый пользователь"
				default:
					FinalGrade = "Жертва мошенничества"
				}

				Tags := make([]simulatordto.Tag, len(session.Tags))

				UserTags := make([]userdomain.Tag, len(session.Tags))
				for i, tag := range session.Tags {

					respTag := simulatordto.Tag{
						Question: tag.Question,
						Answer:   tag.Answer,
					}

					userTag := userdomain.Tag{
						Question: tag.Question,
						Answer:   tag.Answer,
					}

					if val, ok := simulatordomain.TagDictionary[tag.TagID]; ok {
						respTag.Explanation = val
						userTag.Explanation = val
					}

					Tags[i] = respTag
					UserTags[i] = userTag
				}
				isAi := false
				if strings.HasPrefix(session.ScenarioID, "ai_") {
					isAi = true
				}

				if !isAi {
					err = sc.us.SaveTrainingResult(r.Context(), &userdomain.TrainingResult{
						SessionID:  session.SessionID,
						ScenarioID: session.ScenarioID,
						UserID:     session.UserID,
						TotalRisk:  session.TotalRisk,
						FinalGrade: FinalGrade,
						Tags:       UserTags,
					})

					if err != nil {
						slog.Error("failed to save training Result", "error", err)
					}
				}

				resp = simulatordto.ProcessStepResponse{
					SessionID:  session.SessionID,
					Risk:       session.TotalRisk,
					FinalGrade: FinalGrade,
					Tags:       Tags,
					IsOver:     session.IsOver,
					Question:   node.Question,
				}
				writeJSON(w, http.StatusOK, resp)
				return
			case errors.Is(err, simulatordomain.ErrSessionNotFound):
				writeError(w, http.StatusGone, err.Error(), "Время сессии истекло,начните заново")
				return

			case errors.Is(err, simulatordomain.ErrUnknownAnswer):
				writeError(w, http.StatusBadRequest, err.Error(), "Выберите один из данных ответов")
				return

			default:
				writeError(w, http.StatusInternalServerError, err.Error(), "Ошибка на сервере, попробуйте ещё раз ")
				return
			}

		}

		options := []simulatordto.OptionDto{}

		for _, option := range node.Options {
			options = append(options, simulatordto.OptionDto{
				ID:   option.ID,
				Text: option.Text,
			})
		}

		resp := simulatordto.ProcessStepResponse{
			SessionID: session.SessionID,
			Risk:      session.TotalRisk,
			IsOver:    session.IsOver,
			Question:  node.Question,
			Options:   options,
		}

		writeJSON(w, http.StatusOK, resp)

	}
}

func (sc *SimulatorController) GetScenarios() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		role := r.URL.Query().Get("role")

		scenarios := sc.su.GetScenarios()

		resp := simulatordto.GetScenariosResponse{
			Scenarios: make([]*simulatordto.Scenario, 0, len(scenarios)),
		}

		for _, scenario := range scenarios {
			if scenario.Role == role || role == "" {
				resp.Scenarios = append(resp.Scenarios, &simulatordto.Scenario{
					ScenarioID: scenario.ScenarioID,
					Role:       scenario.Role,
					Title:      scenario.Title,
				})
			}
		}
		writeJSON(w, http.StatusOK, resp)
	}
}

func (sc *SimulatorController) GenerateScenario() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		scenarioID, err := sc.su.GenerateScenario(r.Context())
		if err != nil {
			switch {
			case errors.Is(err, simulatordomain.ErrEmptyAiResponse):
				writeError(w, http.StatusBadGateway, err.Error(), "Нейросеть не смогла сгенерировать сценарий, выберите готовый")
				return
			case errors.Is(err, simulatordomain.ErrAPIAi):
				writeError(w, http.StatusBadGateway, err.Error(), "Нейросеть недоступна, Sвыберите готовый сценарий")
				return
			default:
				writeError(w, http.StatusInternalServerError, err.Error(), "Ошибка на сервере, попробуйте ещё раз")
				return
			}
		}

		resp := simulatordto.GenerateScenarioResponse{
			ScenarioID: scenarioID,
		}

		writeJSON(w, http.StatusOK, resp)

	}
}

func writeJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(data); err != nil {
		slog.Error("failed to write json response", "error", err)
	}
}

func writeError(w http.ResponseWriter, status int, errorCode, message string) {
	writeJSON(w, status, map[string]string{
		"error":   errorCode,
		"message": message,
	})
}
