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

export interface GameOption {
  id: string
  text: string
}

export interface GameStartRequest {
  scenario_id: string
  user_id: string
}

export interface GameContinue {
  session_id: string
  risk: number
  is_over: false
  question: string
  options: GameOption[]
}

export interface GameStartResponse extends GameContinue {
  title: string
  role: 'buyer' | 'seller'
}

export interface GameMistake {
  question: string
  answer: string
  explanation: string
}

export interface GameFinal {
  session_id: string
  risk: number
  is_over: true
  final_grade: string
  mistakes: GameMistake[]
}

export type GameStepResponse = GameContinue | GameFinal

export interface GameStepRequest {
  session_id: string
  answer_id: string
}

export interface ScenarioSummary {
  id: string
  title: string
  role: 'buyer' | 'seller'
}

export interface ScenariosResponse {
  scenarios: ScenarioSummary[]
}
