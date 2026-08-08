import { create } from 'zustand'

export interface ResultEntry {
  score: number
  grade: string
  createdAt: string
}

export interface Attempt extends ResultEntry {
  scenarioId: string
  scenarioTitle: string
}

interface ResultsState {
  best: Record<string, ResultEntry>
  attempts: Attempt[]
  addResult: (attempt: Attempt) => void
}

const STORAGE_KEY = 'antiscam_progress'
const MAX_ATTEMPTS = 50

interface StoredProgress {
  best: Record<string, ResultEntry>
  attempts: Attempt[]
}

function load(): StoredProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && parsed.best && Array.isArray(parsed.attempts)) return parsed
    }
    const legacy = localStorage.getItem('antiscam_results')
    if (legacy) {
      const best: Record<string, ResultEntry> = JSON.parse(legacy)
      return { best, attempts: [] }
    }
  } catch {
    // пустой прогресс
  }
  return { best: {}, attempts: [] }
}

function persist(state: StoredProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export const useResultsStore = create<ResultsState>((set) => {
  const initial = load()
  return {
    best: initial.best,
    attempts: initial.attempts,
    addResult: (attempt) =>
      set((state) => {
        const prev = state.best[attempt.scenarioId]
        const best = { ...state.best }
        if (!prev || prev.score < attempt.score) best[attempt.scenarioId] = attempt
        const attempts = [attempt, ...state.attempts].slice(0, MAX_ATTEMPTS)
        const next: StoredProgress = { best, attempts }
        persist(next)
        return next
      }),
  }
})
