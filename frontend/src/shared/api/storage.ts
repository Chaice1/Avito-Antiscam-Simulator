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
