import { create } from 'zustand'
import { getUsername, setUsername as persistUsername, clearUser } from '../../../shared/api/storage'

interface UserState {
  username: string | null
  setUsername: (name: string) => void
  clear: () => void
}

export const useUserStore = create<UserState>((set) => ({
  username: getUsername(),
  setUsername: (name) => {
    persistUsername(name)
    set({ username: name })
  },
  clear: () => {
    clearUser()
    set({ username: null })
  },
}))
