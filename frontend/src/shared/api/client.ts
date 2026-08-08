import type {
  GameStartRequest,
  GameStartResponse,
  GameStepRequest,
  GameStepResponse,
  HistoryResponse,
  RegisterRequest,
  RegisterResponse,
  ScenariosResponse,
} from './types'

const BASE_URL = '/api/v1'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? `API error: ${res.status}`)
  }

  return res.json()
}

export function registerUser(username: string): Promise<RegisterResponse> {
  const body: RegisterRequest = { username }
  return request<RegisterResponse>('/register', { method: 'POST', body: JSON.stringify(body) })
}

export function getHistory(userId: string): Promise<HistoryResponse> {
  return request<HistoryResponse>(`/users/${userId}/history`)
}

export function startGame(payload: GameStartRequest): Promise<GameStartResponse> {
  return request<GameStartResponse>('/game/start', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function stepGame(payload: GameStepRequest): Promise<GameStepResponse> {
  return request<GameStepResponse>('/game/step', { method: 'POST', body: JSON.stringify(payload) })
}

export function getScenarios(role?: 'buyer' | 'seller'): Promise<ScenariosResponse> {
  const query = role ? `?role=${role}` : ''
  return request<ScenariosResponse>(`/scenarios${query}`)
}
