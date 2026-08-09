package llmclient

import (
	simulatordomain "antiscam-simulator/internal/simulator/domain"
	simulatordto "antiscam-simulator/internal/simulator/dto"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"strings"
	"time"
)

type clientLLM struct {
	key      string
	folderID string
	client   *http.Client
}

func NewClientLLM(key string, folderID string) *clientLLM {
	return &clientLLM{
		key:      key,
		folderID: folderID,
		client: &http.Client{
			Timeout: time.Duration(10) * time.Second,
		},
	}
}

const Prompt = `Ты — генератор сценариев для тренажера антискам Авито.
Сгенерируй короткий текстовый квест (сценарий) общения с мошенником.
ПРАВИЛА:
1. Выбери случайный товар.
2. Пользователь выступает в роли покупателя (role: "buyer") или продавца (role: "seller").
3. В поле "tag_id" используй ТОЛЬКО теги из этого списка: 
"WENT_TO_MESSENGER", "GAVE_PERSONAL_DATA", "BELIEVED_FAKE_SCREENSHOT", "CLICKED_PHISHING_LINK", "ASKED_DELIVERY_FIRST", "AGREED_PREPAYMENT", "CONSIDERED_PREPAYMENT", "TRUSTED_FAKE_SMS", "ENGAGED_WITH_SCAMMER", "TRUSTED_REVIEWS", "GOOD_PERSONAL_MEET", "GOOD_REFUSED_PREPAYMENT", "GOOD_STAYED_IN_CHAT", "GOOD_RECOGNIZED_PHISHING", "GOOD_SAFE_DEAL", "GOOD_ORDINARY_CHAT", "GOOD_AGREED_DELIVERY". 
Если тег не подходит, оставь поле пустым: "".

Ответь ТОЛЬКО валидным JSON, без markdown-разметки (без тройных обратных кавычек).
Формат JSON:
{
  "scenario": {
    "scenario_id": "ai_gen",
    "title": "Название ситуации (например: Покупка гитары)",
    "role": "buyer"
  },
  "start_node_id": "node_1",
  "nodes": {
    "node_1": {
      "question": "Реплика мошенника",
      "options": [
        { "id": "ans_1", "text": "Безопасный ответ", "risk": 0, "tag_id": "GOOD_STAYED_IN_CHAT", "next_node_id": "node_win" },
        { "id": "ans_2", "text": "Опасный ответ", "risk": 100, "tag_id": "CLICKED_PHISHING_LINK", "next_node_id": "game_over" }
      ]
    },
    "node_win": { "question": "Вы не дали себя обмануть.", "options": [] },
    "game_over": { "question": "Мошенник украл ваши деньги.", "options": [] }
  }
}`

func (cllm *clientLLM) GenerateScenario(ctx context.Context) (*simulatordto.Graph, error) {
	reqBody := map[string]interface{}{
		"modelUri": fmt.Sprintf("gpt://%s/yandexgpt-lite", cllm.folderID),
		"completionOptions": map[string]interface{}{
			"stream":      false,
			"temperature": 0.7,
			"maxTokens":   2000,
		},
		"messages": []map[string]string{
			{"role": "system", "text": Prompt},
			{"role": "user", "text": "Сгенерируй новый уникальный сценарий"},
		},
	}

	bodyBytes, err := json.Marshal(reqBody)

	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, "https://llm.api.cloud.yandex.net/foundationModels/v1/completion", bytes.NewBuffer(bodyBytes))
	if err != nil {
		slog.Error("failed to create req", "error", err)
		return nil, err
	}

	req.Header.Set("Authorization", "Api-key "+cllm.key)
	req.Header.Set("Content-Type", "application/json")

	resp, err := cllm.client.Do(req)

	if err != nil {
		slog.Error("failed to do req", "error", err)
		return nil, simulatordomain.ErrServiceIsUnavailable
	}

	defer func() {
		errBody := resp.Body.Close()
		if errBody != nil {
			slog.Error("failed to close body", "error", errBody)
		}
	}()

	if resp.StatusCode != http.StatusOK {
		return nil, simulatordomain.ErrApiAi
	}

	var aiResp struct {
		Result struct {
			Alternatives []struct {
				Message struct {
					Text string `json:"text"`
				} `json:"message"`
			} `json:"alternatives"`
		} `json:"result"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&aiResp); err != nil {
		return nil, err
	}

	if len(aiResp.Result.Alternatives) == 0 {
		return nil, simulatordomain.ErrEmptyAiResponse
	}

	jsonText := aiResp.Result.Alternatives[0].Message.Text
	jsonText = strings.TrimPrefix(jsonText, "```json")
	jsonText = strings.TrimPrefix(jsonText, "```")
	jsonText = strings.TrimSuffix(jsonText, "```")
	jsonText = strings.TrimSpace(jsonText)

	var graphDto simulatordto.Graph
	if err := json.Unmarshal([]byte(jsonText), &graphDto); err != nil {
		return nil, err
	}

	graphDto.Scenario.ScenarioID = fmt.Sprintf("ai_%d", time.Now().Unix())

	return &graphDto, nil
}
