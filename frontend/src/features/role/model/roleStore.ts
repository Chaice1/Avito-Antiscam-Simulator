import { create } from 'zustand'

export type Role = 'buyer' | 'seller'

interface RoleState {
  role: Role | null
  setRole: (role: Role) => void
}

export const useRoleStore = create<RoleState>((set) => ({
  role: null,
  setRole: (role) => set({ role }),
}))
