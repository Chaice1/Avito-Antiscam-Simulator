const USER_ID_KEY = 'antiscam_user_id'

export function getUserId(): string | null {
  return localStorage.getItem(USER_ID_KEY)
}

export function setUserId(id: string): void {
  localStorage.setItem(USER_ID_KEY, id)
}
