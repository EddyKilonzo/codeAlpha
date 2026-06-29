import { LEVELS } from './constants'
import type { LevelInfo } from '@/types'

export function getLevelFromXP(xp: number): number {
  let level = 1
  for (const tier of LEVELS) {
    if (xp >= tier.minXP) {
      level = tier.level
    }
  }
  return level
}

export function getLevelTitle(level: number): string {
  const tier = LEVELS.find((l) => l.level === level)
  return tier?.title ?? 'Rookie'
}

export function getLevelInfo(level: number): LevelInfo {
  const current = LEVELS.find((l) => l.level === level)
  const next = LEVELS.find((l) => l.level === level + 1)
  return {
    level,
    title: current?.title ?? 'Rookie',
    minXP: current?.minXP ?? 0,
    maxXP: next?.minXP ?? Infinity,
  }
}

export function getProgressToNextLevel(xp: number): {
  current: number
  needed: number
  percentage: number
  nextLevel: number
  nextTitle: string
} {
  const level = getLevelFromXP(xp)
  const info = getLevelInfo(level)
  const nextLevel = Math.min(level + 1, 10)
  const nextInfo = getLevelInfo(nextLevel)

  if (level >= 10) {
    return { current: xp - info.minXP, needed: 0, percentage: 100, nextLevel: 10, nextTitle: info.title }
  }

  const rangeSize = nextInfo.minXP - info.minXP
  const progress = xp - info.minXP
  const percentage = Math.min(Math.round((progress / rangeSize) * 100), 100)

  return {
    current: progress,
    needed: rangeSize - progress,
    percentage,
    nextLevel,
    nextTitle: nextInfo.title,
  }
}
