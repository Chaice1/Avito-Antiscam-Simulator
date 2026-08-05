import type {
  HistoryResponse,
  RegisterRequest,
  RegisterResponse,
  SaveGameRequest,
  SaveGameResponse,
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

export function saveGame(payload: SaveGameRequest): Promise<SaveGameResponse> {
  return request<SaveGameResponse>('/games', { method: 'POST', body: JSON.stringify(payload) })
}

export function getHistory(userId: string): Promise<HistoryResponse> {
  return request<HistoryResponse>(`/users/${userId}/history`)
}
