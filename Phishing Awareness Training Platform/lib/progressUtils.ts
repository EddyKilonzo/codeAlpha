import { XP_REWARDS, MODULE_IDS, PASSING_SCORE, TOTAL_MODULES } from './constants'
import type { UserProgress, QuizScore, FlashcardProgress, Achievement } from '@/types'

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

  return { newStreak: 1, xpBonus: 0 }
}

// ─── Validation helpers ───────────────────────────────────────────────────────

const VALID_MODULE_IDS: ReadonlySet<string> = new Set(MODULE_IDS)

const VALID_ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/

function isValidISODate(v: unknown): v is string {
  return typeof v === 'string' && VALID_ISO_RE.test(v) && !Number.isNaN(Date.parse(v))
}

function safePositiveInt(v: unknown, max = Infinity): number {
  if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) return 0
  return Math.min(Math.floor(v), max)
}

// Like safePositiveInt but keeps up to 2 decimals — quiz scores can be
// fractional thanks to partial credit on multi-answer questions (e.g. 87.89).
function safeScore(v: unknown, max = 100): number {
  if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) return 0
  return Math.min(Math.round(v * 100) / 100, max)
}

function safeModuleIdArray(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return [...new Set(v.filter((id): id is string => typeof id === 'string' && VALID_MODULE_IDS.has(id)))]
}

function safeQuizScores(v: unknown): Record<string, QuizScore> {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return {}
  const result: Record<string, QuizScore> = {}
  for (const [key, raw] of Object.entries(v as Record<string, unknown>)) {
    if (!VALID_MODULE_IDS.has(key)) continue
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) continue
    const entry = raw as Record<string, unknown>
    const score = safeScore(entry.score, 100)
    const attempts = safePositiveInt(entry.attempts, 9999)
    const xpEarned = safePositiveInt(entry.xpEarned, 9999)
    // Always recompute from score so threshold changes apply to existing data
    const passed = score >= PASSING_SCORE
    const completedAt = isValidISODate(entry.completedAt) ? entry.completedAt : new Date().toISOString()
    result[key] = { moduleId: key, score, attempts, passed, completedAt, xpEarned }
  }
  return result
}

function safeFlashcardProgress(v: unknown): Record<string, FlashcardProgress> {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return {}
  const result: Record<string, FlashcardProgress> = {}
  for (const [key, raw] of Object.entries(v as Record<string, unknown>)) {
    if (!VALID_MODULE_IDS.has(key)) continue
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) continue
    const entry = raw as Record<string, unknown>
    result[key] = {
      moduleId: key,
      knownIds: Array.isArray(entry.knownIds)
        ? entry.knownIds.filter((id): id is string => typeof id === 'string').slice(0, 500)
        : [],
      reviewLaterIds: Array.isArray(entry.reviewLaterIds)
        ? entry.reviewLaterIds.filter((id): id is string => typeof id === 'string').slice(0, 500)
        : [],
      completed: typeof entry.completed === 'boolean' ? entry.completed : false,
    }
  }
  return result
}

function safeLessonViewedAt(v: unknown): Record<string, string> {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return {}
  const result: Record<string, string> = {}
  for (const [key, val] of Object.entries(v as Record<string, unknown>)) {
    if (!VALID_MODULE_IDS.has(key)) continue
    if (isValidISODate(val)) result[key] = val
  }
  return result
}

// Max length for user-supplied strings stored in LS
const MAX_NAME_LEN = 100
const CERT_ID_RE = /^PHG-[A-F0-9]{8}$/

const VALID_ACHIEVEMENT_CATEGORIES = new Set<Achievement['category']>([
  'progress', 'quiz', 'streak', 'exploration', 'mastery',
])

function safeAchievements(v: unknown): Achievement[] {
  if (!Array.isArray(v)) return []
  const seen = new Set<string>()
  return v.reduce<Achievement[]>((acc, item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return acc
    const a = item as Record<string, unknown>
    if (typeof a.id !== 'string' || !a.id || seen.has(a.id)) return acc
    const unlockedAt = isValidISODate(a.unlockedAt) ? a.unlockedAt : null
    const rawCat = a.category as string
    const category: Achievement['category'] = VALID_ACHIEVEMENT_CATEGORIES.has(rawCat as Achievement['category'])
      ? (rawCat as Achievement['category'])
      : 'progress'
    seen.add(a.id)
    acc.push({
      id: a.id,
      title: typeof a.title === 'string' ? a.title.slice(0, 200) : '',
      description: typeof a.description === 'string' ? a.description.slice(0, 500) : '',
      icon: typeof a.icon === 'string' ? a.icon.slice(0, 50) : 'Trophy',
      unlockedAt,
      xpReward: safePositiveInt(a.xpReward, 9999),
      criteria: typeof a.criteria === 'string' ? a.criteria.slice(0, 500) : '',
      category,
    })
    return acc
  }, [])
}

function safeUserName(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const trimmed = v.trim().slice(0, MAX_NAME_LEN)
  return trimmed.length >= 2 ? trimmed : null
}

function safeCertId(v: unknown): string | null {
  if (typeof v !== 'string') return null
  return CERT_ID_RE.test(v) ? v : null
}

// ─── Public migration / validation entry point ────────────────────────────────

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
    certificateId: null,
    flashcardProgress: {},
    lessonViewedAt: {},
    voiceCompletedModules: [],
    totalXPEarned: 0,
    lastActiveModule: null,
    lastActiveTabByModule: {},
  }

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return DEFAULT

  const d = raw as Record<string, unknown>

  const xp = safePositiveInt(d.xp, 999_999)
  const totalXPEarned = safePositiveInt(d.totalXPEarned, 999_999)
  const level = Math.min(Math.max(safePositiveInt(d.level, 10), 1), 10)
  const streak = safePositiveInt(d.streak, 9999)
  const completedModules = safeModuleIdArray(d.completedModules)
  const quizScoresSafe = safeQuizScores(d.quizScores)
  // Certificate requires every module completed AND every quiz passed at ≥ PASSING_SCORE
  const allModulesDone = completedModules.length >= TOTAL_MODULES
  const allQuizzesPassed = MODULE_IDS.every((id) => quizScoresSafe[id]?.passed === true)
  const certificateEligible = allModulesDone && allQuizzesPassed

  const unlockedRaw = safeModuleIdArray(d.unlockedModules)
  const unlockedModules = unlockedRaw.length > 0 ? unlockedRaw : ['introduction']

  const lastActiveModule = typeof d.lastActiveModule === 'string' && VALID_MODULE_IDS.has(d.lastActiveModule as string)
    ? d.lastActiveModule as string
    : null

  const VALID_TABS = new Set(['lesson', 'flashcards', 'simulations', 'quiz'])
  const lastActiveTabByModule: Record<string, string> = {}
  if (d.lastActiveTabByModule && typeof d.lastActiveTabByModule === 'object' && !Array.isArray(d.lastActiveTabByModule)) {
    for (const [k, v] of Object.entries(d.lastActiveTabByModule as Record<string, unknown>)) {
      if (VALID_MODULE_IDS.has(k) && typeof v === 'string' && VALID_TABS.has(v)) {
        lastActiveTabByModule[k] = v
      }
    }
  }

  return {
    xp,
    level,
    unlockedModules,
    completedModules,
    quizScores: quizScoresSafe,
    achievements: safeAchievements(d.achievements),
    streak,
    lastActive: isValidISODate(d.lastActive) ? d.lastActive : null,
    certificateEligible,
    userName: safeUserName(d.userName),
    certificateId: safeCertId(d.certificateId),
    flashcardProgress: safeFlashcardProgress(d.flashcardProgress),
    lessonViewedAt: safeLessonViewedAt(d.lessonViewedAt),
    voiceCompletedModules: safeModuleIdArray(d.voiceCompletedModules),
    totalXPEarned,
    lastActiveModule,
    lastActiveTabByModule,
  }
}

export function formatXP(xp: number): string {
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}k`
  return xp.toString()
}
