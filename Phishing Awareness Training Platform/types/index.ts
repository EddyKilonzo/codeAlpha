// ─── Question Types ───────────────────────────────────────────────────────────

export type QuestionType =
  | 'multiple-choice'
  | 'multiple-select'
  | 'true-false'
  | 'hotspot'
  | 'drag-drop'
  | 'scenario'
  | 'match-pair'
  | 'email-inspection'
  | 'website-inspection'
  | 'url-recognition'
  | 'timeline-ordering'
  | 'decision'

export interface Hint {
  level: 1 | 2 | 3
  text: string
  xpPenalty: number
}

export interface HotspotRegion {
  id: string
  x: number
  y: number
  width: number
  height: number
  label: string
  isSuspicious: boolean
  explanation: string
}

export interface Question {
  id: string
  type: QuestionType
  prompt: string
  options?: string[]
  answer: string | string[]
  explanation: string
  hints: [Hint, Hint, Hint]
  imageUrl?: string
  dragItems?: string[]
  dropZones?: string[]
  matchPairs?: Record<string, string>
  hotspotRegions?: HotspotRegion[]
  timelineItems?: string[]
  scenario?: string
}

export interface Quiz {
  id: string
  moduleId: string
  questions: Question[]
  passingScore: number
}

// ─── Module ───────────────────────────────────────────────────────────────────

export interface Module {
  id: string
  title: string
  description: string
  order: number
  locked: boolean
  completed: boolean
  xpReward: number
  estimatedMinutes: number
  icon: string
  color: string
}

// ─── Flashcard ────────────────────────────────────────────────────────────────

export interface Flashcard {
  id: string
  moduleId: string
  front: string
  back: string
  example?: string
  known: boolean
  reviewLater: boolean
}

export interface FlashcardProgress {
  moduleId: string
  knownIds: string[]
  reviewLaterIds: string[]
  completed: boolean
}

// ─── Achievement ──────────────────────────────────────────────────────────────

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt: string | null
  xpReward: number
  criteria: string
  category: 'progress' | 'quiz' | 'streak' | 'exploration' | 'mastery'
}

// ─── Progress ─────────────────────────────────────────────────────────────────

export interface QuizScore {
  moduleId: string
  score: number
  attempts: number
  passed: boolean
  completedAt: string
  xpEarned: number
}

export interface LevelInfo {
  level: number
  title: string
  minXP: number
  maxXP: number
}

export interface UserProgress {
  xp: number
  level: number
  unlockedModules: string[]
  completedModules: string[]
  quizScores: Record<string, QuizScore>
  achievements: Achievement[]
  streak: number
  lastActive: string | null
  certificateEligible: boolean
  userName: string | null
  certificateId: string | null
  flashcardProgress: Record<string, FlashcardProgress>
  lessonViewedAt: Record<string, string>
  voiceCompletedModules: string[]
  totalXPEarned: number
  // Session resumption — restored on next visit
  lastActiveModule: string | null
  lastActiveTabByModule: Record<string, string>
}

// ─── Voice Summary ────────────────────────────────────────────────────────────

export interface VoiceSummary {
  moduleId: string
  preQuizScript: string
  postQuizScript: string
  estimatedSeconds: number
}

// ─── Gamification Notifications ───────────────────────────────────────────────

export type GamificationNotification =
  | { id: string; type: 'achievement'; achievement: Achievement }
  | { id: string; type: 'level-up'; level: number; title: string }
  | { id: string; type: 'module-complete'; moduleId: string; moduleTitle: string }

// ─── Case Study ───────────────────────────────────────────────────────────────

export interface CaseStudyTimelineEvent {
  date: string
  title: string
  description: string
  type: 'attack' | 'discovery' | 'response' | 'impact' | 'resolution'
}

export interface CaseStudy {
  id: string
  title: string
  target: string
  year: number
  attackMethod: string
  financialImpact: string
  summary: string
  timeline: CaseStudyTimelineEvent[]
  attackFlow: string[]
  lessonsLearned: string[]
  preventionTips: string[]
  severity: 'critical' | 'high' | 'medium'
}

// ─── Simulation ───────────────────────────────────────────────────────────────

export type SimulationType =
  | 'email-outlook'
  | 'email-gmail'
  | 'login-page'
  | 'sms'
  | 'phone-transcript'
  | 'qr-code'
  | 'teams-message'
  | 'slack-message'
  | 'browser-warning'

export interface SimulationFlag {
  id: string
  label: string
  description: string
  position: { top: number; left: number; width: number; height: number }
  type: 'malicious' | 'warning' | 'safe'
  pointValue: number
}

export interface Simulation {
  id: string
  moduleId: string
  type: SimulationType
  title: string
  description: string
  flags: SimulationFlag[]
  hints?: string[]
  content: Record<string, unknown>
}
