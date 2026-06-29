"use client"

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { UserProgress, QuizScore, Achievement, FlashcardProgress, GamificationNotification } from '@/types'
import { STORAGE_KEY, TOTAL_MODULES } from '@/lib/constants'
import { getLevelFromXP, getLevelInfo } from '@/lib/levelUtils'
import { calculateStreakDelta, migrateProgress } from '@/lib/progressUtils'
import { MODULES } from '@/data/modules'
import { ACHIEVEMENTS } from '@/data/achievements'

// ─── Default State ────────────────────────────────────────────────────────────

const DEFAULT_PROGRESS: UserProgress = {
  xp: 0,
  level: 1,
  unlockedModules: ['introduction'],
  completedModules: [],
  quizScores: {},
  achievements: [],
  streak: 0,
  lastActive: null,
  certificateEligible: false,
  userName: null,
  certificateId: null,
  flashcardProgress: {},
  lessonViewedAt: {},
  voiceCompletedModules: [],
  totalXPEarned: 0,
}

// ─── Action Types ─────────────────────────────────────────────────────────────

type ProgressAction =
  | { type: 'HYDRATE'; payload: UserProgress }
  | { type: 'ADD_XP'; payload: { amount: number } }
  | { type: 'UNLOCK_MODULE'; payload: { moduleId: string } }
  | { type: 'COMPLETE_MODULE'; payload: { moduleId: string } }
  | { type: 'SAVE_QUIZ_SCORE'; payload: QuizScore }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: { achievementId: string } }
  | { type: 'UPDATE_STREAK' }
  | { type: 'SET_USERNAME'; payload: { name: string } }
  | { type: 'MARK_LESSON_VIEWED'; payload: { moduleId: string } }
  | { type: 'MARK_VOICE_COMPLETE'; payload: { moduleId: string } }
  | { type: 'SET_FLASHCARD_KNOWN'; payload: { moduleId: string; cardId: string } }
  | { type: 'SET_FLASHCARD_REVIEW'; payload: { moduleId: string; cardId: string } }
  | { type: 'COMPLETE_FLASHCARDS'; payload: { moduleId: string } }
  | { type: 'SET_CERTIFICATE_ID'; payload: { id: string } }

// ─── Reducer ──────────────────────────────────────────────────────────────────

function progressReducer(state: UserProgress, action: ProgressAction): UserProgress {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload

    case 'ADD_XP': {
      const newXP = state.xp + action.payload.amount
      const newTotalXP = state.totalXPEarned + action.payload.amount
      const newLevel = getLevelFromXP(newXP)
      return { ...state, xp: newXP, level: newLevel, totalXPEarned: newTotalXP }
    }

    case 'UNLOCK_MODULE': {
      if (state.unlockedModules.includes(action.payload.moduleId)) return state
      return {
        ...state,
        unlockedModules: [...state.unlockedModules, action.payload.moduleId],
      }
    }

    case 'COMPLETE_MODULE': {
      const { moduleId } = action.payload
      if (state.completedModules.includes(moduleId)) return state

      const updatedCompleted = [...state.completedModules, moduleId]

      // Auto-unlock next module
      const currentModule = MODULES.find((m) => m.id === moduleId)
      const nextModule = currentModule
        ? MODULES.find((m) => m.order === currentModule.order + 1)
        : null

      let updatedUnlocked = [...state.unlockedModules]
      if (nextModule && !updatedUnlocked.includes(nextModule.id)) {
        updatedUnlocked = [...updatedUnlocked, nextModule.id]
      }

      const certificateEligible = updatedCompleted.length >= TOTAL_MODULES

      return {
        ...state,
        completedModules: updatedCompleted,
        unlockedModules: updatedUnlocked,
        certificateEligible,
      }
    }

    case 'SAVE_QUIZ_SCORE': {
      const existing = state.quizScores[action.payload.moduleId]
      const bestScore = existing
        ? Math.max(existing.score, action.payload.score)
        : action.payload.score

      return {
        ...state,
        quizScores: {
          ...state.quizScores,
          [action.payload.moduleId]: {
            ...action.payload,
            score: bestScore,
            attempts: (existing?.attempts ?? 0) + 1,
          },
        },
      }
    }

    case 'UNLOCK_ACHIEVEMENT': {
      const already = state.achievements.find((a) => a.id === action.payload.achievementId)
      if (already?.unlockedAt) return state

      const definition = ACHIEVEMENTS.find((a) => a.id === action.payload.achievementId)
      if (!definition) return state

      const unlocked: Achievement = { ...definition, unlockedAt: new Date().toISOString() }
      const others = state.achievements.filter((a) => a.id !== action.payload.achievementId)

      return {
        ...state,
        achievements: [...others, unlocked],
      }
    }

    case 'UPDATE_STREAK': {
      const { newStreak, xpBonus } = calculateStreakDelta(state.lastActive, state.streak)
      const newXP = state.xp + xpBonus
      return {
        ...state,
        streak: newStreak,
        lastActive: new Date().toISOString(),
        xp: newXP,
        level: getLevelFromXP(newXP),
        totalXPEarned: state.totalXPEarned + xpBonus,
      }
    }

    case 'SET_USERNAME':
      return { ...state, userName: action.payload.name }

    case 'SET_CERTIFICATE_ID':
      return { ...state, certificateId: action.payload.id }

    case 'MARK_LESSON_VIEWED': {
      if (state.lessonViewedAt[action.payload.moduleId]) return state
      return {
        ...state,
        lessonViewedAt: {
          ...state.lessonViewedAt,
          [action.payload.moduleId]: new Date().toISOString(),
        },
      }
    }

    case 'MARK_VOICE_COMPLETE': {
      if (state.voiceCompletedModules.includes(action.payload.moduleId)) return state
      return {
        ...state,
        voiceCompletedModules: [...state.voiceCompletedModules, action.payload.moduleId],
      }
    }

    case 'SET_FLASHCARD_KNOWN': {
      const { moduleId, cardId } = action.payload
      const existing: FlashcardProgress = state.flashcardProgress[moduleId] ?? {
        moduleId,
        knownIds: [],
        reviewLaterIds: [],
        completed: false,
      }
      if (existing.knownIds.includes(cardId)) return state
      return {
        ...state,
        flashcardProgress: {
          ...state.flashcardProgress,
          [moduleId]: {
            ...existing,
            knownIds: [...existing.knownIds, cardId],
            reviewLaterIds: existing.reviewLaterIds.filter((id) => id !== cardId),
          },
        },
      }
    }

    case 'SET_FLASHCARD_REVIEW': {
      const { moduleId, cardId } = action.payload
      const existing: FlashcardProgress = state.flashcardProgress[moduleId] ?? {
        moduleId,
        knownIds: [],
        reviewLaterIds: [],
        completed: false,
      }
      if (existing.reviewLaterIds.includes(cardId)) return state
      return {
        ...state,
        flashcardProgress: {
          ...state.flashcardProgress,
          [moduleId]: {
            ...existing,
            reviewLaterIds: [...existing.reviewLaterIds, cardId],
            knownIds: existing.knownIds.filter((id) => id !== cardId),
          },
        },
      }
    }

    case 'COMPLETE_FLASHCARDS': {
      const { moduleId } = action.payload
      const existing: FlashcardProgress = state.flashcardProgress[moduleId] ?? {
        moduleId,
        knownIds: [],
        reviewLaterIds: [],
        completed: false,
      }
      return {
        ...state,
        flashcardProgress: {
          ...state.flashcardProgress,
          [moduleId]: { ...existing, completed: true },
        },
      }
    }

    default:
      return state
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface ProgressContextType {
  state: UserProgress
  dispatch: React.Dispatch<ProgressAction>
  isHydrated: boolean
  pendingNotifications: GamificationNotification[]
  clearNotification: (id: string) => void
}

const ProgressContext = createContext<ProgressContextType | null>(null)

let _notifCounter = 0
const notifId = () => `notif-${++_notifCounter}-${Date.now()}`

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(progressReducer, DEFAULT_PROGRESS)
  const [isHydrated, setIsHydrated] = useState(false)
  const [pendingNotifications, setPendingNotifications] = useState<GamificationNotification[]>([])
  const prevStateRef = useRef<UserProgress>(DEFAULT_PROGRESS)

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        const migrated = migrateProgress(parsed)
        dispatch({ type: 'HYDRATE', payload: migrated })
        prevStateRef.current = migrated
      }
    } catch {
      // localStorage unavailable or corrupted — use defaults
    } finally {
      setIsHydrated(true)
    }
  }, [])

  // Persist to localStorage on every state change (after hydration)
  useEffect(() => {
    if (!isHydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // localStorage write failed (quota exceeded, etc.)
    }
  }, [state, isHydrated])

  // Diff state after each change to detect new achievements, level-ups, module completions
  useEffect(() => {
    if (!isHydrated) {
      prevStateRef.current = state
      return
    }
    const prev = prevStateRef.current
    const notifications: GamificationNotification[] = []

    // New achievements
    for (const a of state.achievements) {
      if (!a.unlockedAt) continue
      const prevA = prev.achievements.find((pa) => pa.id === a.id)
      if (!prevA?.unlockedAt) {
        notifications.push({ id: notifId(), type: 'achievement', achievement: a })
      }
    }

    // Level up
    if (state.level > prev.level) {
      const info = getLevelInfo(state.level)
      notifications.push({ id: notifId(), type: 'level-up', level: state.level, title: info.title })
    }

    // Module completions
    for (const moduleId of state.completedModules) {
      if (!prev.completedModules.includes(moduleId)) {
        const mod = MODULES.find((m) => m.id === moduleId)
        if (mod) {
          notifications.push({ id: notifId(), type: 'module-complete', moduleId, moduleTitle: mod.title })
        }
      }
    }

    if (notifications.length > 0) {
      setPendingNotifications((q) => [...q, ...notifications])
    }

    prevStateRef.current = state
  }, [state, isHydrated])

  const clearNotification = useCallback((id: string) => {
    setPendingNotifications((q) => q.filter((n) => n.id !== id))
  }, [])

  return (
    <ProgressContext.Provider value={{ state, dispatch, isHydrated, pendingNotifications, clearNotification }}>
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgressContext() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgressContext must be used within ProgressProvider')
  return ctx
}
