import { registerUser } from './client'

const USER_ID_KEY = 'antiscam_user_id'

export function getUserId(): string | null {
  return localStorage.getItem(USER_ID_KEY)
}

export function setUserId(id: string): void {
  localStorage.setItem(USER_ID_KEY, id)
}

export function getOrCreateUserId(): string {
  const existing = getUserId()
  if (existing) return existing
  const id = crypto.randomUUID()
  setUserId(id)
  return id
}

// Регистрация на бэке (POST /register): берём user_id с сервера,
// если бэк недоступен — локальный UUID.
export async function ensureUserId(): Promise<string> {
  const existing = getUserId()
  if (existing) return existing
  try {
    const res = await registerUser(`user_${Date.now()}`)
    setUserId(res.user_id)
    return res.user_id
  } catch {
    return getOrCreateUserId()
  }
}
