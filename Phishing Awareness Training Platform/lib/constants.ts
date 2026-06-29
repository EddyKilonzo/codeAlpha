export const STORAGE_KEY = 'phishing_training_progress' as const

export const PASSING_SCORE = 75

export const TOTAL_MODULES = 6

export const XP_REWARDS = {
  LESSON_VIEW: 10,
  FLASHCARD_COMPLETE: 15,
  FLASHCARD_CARD_KNOWN: 2,
  VOICE_COMPLETE: 5,
  VOICE_SKIP: 2,
  QUIZ_PASS: 50,
  QUIZ_PERFECT_BONUS: 25,
  MODULE_COMPLETE: 100,
  STREAK_BONUS: 20,
  SIMULATION_COMPLETE: 30,
  SIMULATION_PERFECT: 15,
} as const

export const XP_PENALTIES = {
  HINT_1: 5,
  HINT_2: 10,
  HINT_3: 15,
} as const

export const LEVELS = [
  { level: 1,  title: 'Rookie',        minXP: 0    },
  { level: 2,  title: 'Learner',        minXP: 100  },
  { level: 3,  title: 'Aware',          minXP: 250  },
  { level: 4,  title: 'Vigilant',       minXP: 450  },
  { level: 5,  title: 'Defender',       minXP: 700  },
  { level: 6,  title: 'Analyst',        minXP: 1000 },
  { level: 7,  title: 'Guardian',       minXP: 1350 },
  { level: 8,  title: 'Expert',         minXP: 1750 },
  { level: 9,  title: 'Specialist',     minXP: 2200 },
  { level: 10, title: 'Cyber Guardian', minXP: 2700 },
] as const

export const MODULE_IDS = [
  'introduction',
  'types-of-phishing',
  'attacker-operations',
  'advanced-threats',
  'case-studies',
  'defense-best-practices',
] as const

export type ModuleId = typeof MODULE_IDS[number]
