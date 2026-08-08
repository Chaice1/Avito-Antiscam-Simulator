export interface RegisterRequest {
  username: string
}

export interface RegisterResponse {
  user_id: string
}

export interface HistoryItem {
  scenario_id: string
  total_risk: number
  final_grade: string
  tags: GameTag[]
  created_at: string
}

export interface HistoryResponse {
  user_id: string
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

export interface GameTag {
  question: string
  answer: string
  explanation: string
}

export interface GameFinal {
  session_id: string
  risk: number
  is_over: true
  final_grade: string
  tags: GameTag[]
}

export type GameStepResponse = GameContinue | GameFinal

export interface GameStepRequest {
  session_id: string
  answer_id: string
}

export interface ScenarioSummary {
  scenario_id: string
  title: string
  role: 'buyer' | 'seller'
}

export interface ScenariosResponse {
  scenarios: ScenarioSummary[]
}
