export interface RegisterRequest {
  username: string
}

export interface RegisterResponse {
  id: string
  username: string
  created_at: string
}

export interface SaveGameRequest {
  user_id: string
  scenario_id: string
  scenario_description: string
  risk_level: string
}

export interface SaveGameResponse {
  message: string
}

export interface HistoryItem {
  scenario_id: string
  scenario_description: string
  risk_level: string
  created_at: string
}

export interface HistoryResponse {
  history: HistoryItem[]
}
