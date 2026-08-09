import { registerUser } from './client'

const USER_ID_KEY = 'antiscam_user_id'
const USERNAME_KEY = 'antiscam_username'

export function getUserId(): string | null {
  return localStorage.getItem(USER_ID_KEY)
}

export function setUserId(id: string): void {
  localStorage.setItem(USER_ID_KEY, id)
}

export function getUsername(): string | null {
  return localStorage.getItem(USERNAME_KEY)
}

export function setUsername(name: string): void {
  localStorage.setItem(USERNAME_KEY, name)
}

export function clearUser(): void {
  localStorage.removeItem(USER_ID_KEY)
  localStorage.removeItem(USERNAME_KEY)
}

// Явная регистрация по нику: POST /register -> user_id + ник в LocalStorage.
export async function registerWithName(username: string): Promise<void> {
  const res = await registerUser(username)
  setUserId(res.user_id)
  setUsername(username)
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
