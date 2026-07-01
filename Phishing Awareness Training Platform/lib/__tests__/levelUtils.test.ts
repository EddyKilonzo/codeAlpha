import { describe, it, expect } from 'vitest'
import {
  getLevelFromXP,
  getLevelTitle,
  getLevelInfo,
  getProgressToNextLevel,
} from '@/lib/levelUtils'

describe('getLevelFromXP', () => {
  it('clamps to level 1 at or below zero XP', () => {
    expect(getLevelFromXP(-100)).toBe(1)
    expect(getLevelFromXP(0)).toBe(1)
    expect(getLevelFromXP(99)).toBe(1)
  })
  it('maps XP thresholds to levels', () => {
    expect(getLevelFromXP(100)).toBe(2)
    expect(getLevelFromXP(700)).toBe(5)
    expect(getLevelFromXP(2700)).toBe(10)
  })
  it('caps at the max level for huge XP', () => {
    expect(getLevelFromXP(9_999_999)).toBe(10)
  })
})

describe('getLevelTitle / getLevelInfo', () => {
  it('returns the correct title', () => {
    expect(getLevelTitle(5)).toBe('Defender')
    expect(getLevelTitle(10)).toBe('Cyber Guardian')
    expect(getLevelTitle(999)).toBe('Rookie') // fallback
  })
  it('returns the XP range for a level', () => {
    expect(getLevelInfo(5)).toEqual({ level: 5, title: 'Defender', minXP: 700, maxXP: 1000 })
  })
  it('has an unbounded max at the top level', () => {
    expect(getLevelInfo(10).maxXP).toBe(Infinity)
  })
})

describe('getProgressToNextLevel', () => {
  it('reports progress toward the next level', () => {
    const p = getProgressToNextLevel(700) // exactly level 5
    expect(p.nextLevel).toBe(6)
    expect(p.nextTitle).toBe('Analyst')
    expect(p.current).toBe(0)
    expect(p.needed).toBe(300) // 1000 - 700
    expect(p.percentage).toBe(0)
  })
  it('is complete at the max level', () => {
    const p = getProgressToNextLevel(5000)
    expect(p.percentage).toBe(100)
    expect(p.needed).toBe(0)
  })
})
