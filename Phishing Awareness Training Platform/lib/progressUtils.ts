import { XP_REWARDS } from './constants'
import type { UserProgress } from '@/types'

export function isToday(isoString: string): boolean {
  const date = new Date(isoString)
  const today = new Date()
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
}

export function isYesterday(isoString: string): boolean {
  const date = new Date(isoString)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return (
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()
  )
}

export function calculateStreakDelta(
  lastActive: string | null,
  currentStreak: number
): { newStreak: number; xpBonus: number } {
  if (!lastActive) {
    return { newStreak: 1, xpBonus: 0 }
  }

  if (isToday(lastActive)) {
    return { newStreak: currentStreak, xpBonus: 0 }
  }

  if (isYesterday(lastActive)) {
    const newStreak = currentStreak + 1
    const xpBonus = newStreak >= 3 ? XP_REWARDS.STREAK_BONUS : 0
    return { newStreak, xpBonus }
  }

  // Streak broken — reset to 1
  return { newStreak: 1, xpBonus: 0 }
}

export function migrateProgress(raw: unknown): UserProgress {
  const DEFAULT: UserProgress = {
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
    flashcardProgress: {},
    lessonViewedAt: {},
    voiceCompletedModules: [],
    totalXPEarned: 0,
  }

  if (!raw || typeof raw !== 'object') return DEFAULT

  return { ...DEFAULT, ...(raw as Partial<UserProgress>) }
}

export function formatXP(xp: number): string {
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}k`
  return xp.toString()
}
