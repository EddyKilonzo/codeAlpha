import { describe, it, expect } from 'vitest'
import { isToday, migrateProgress, formatXP } from '@/lib/progressUtils'

describe('isToday', () => {
  it('is true for the current timestamp', () => {
    expect(isToday(new Date().toISOString())).toBe(true)
  })
  it('is false for a clearly old date and for junk', () => {
    expect(isToday('2000-01-01T00:00:00.000Z')).toBe(false)
    expect(isToday('not-a-date')).toBe(false)
  })
})

describe('formatXP', () => {
  it('formats XP, abbreviating thousands with "k"', () => {
    expect(formatXP(0)).toBe('0')
    expect(formatXP(999)).toBe('999')
    expect(formatXP(1500)).toBe('1.5k')
    expect(formatXP(2700)).toBe('2.7k')
  })
})

describe('migrateProgress — quiz score sanitisation', () => {
  const makeRaw = (score: unknown) => ({
    quizScores: {
      introduction: {
        moduleId: 'introduction',
        score,
        attempts: 1,
        completedAt: '2026-01-01T00:00:00.000Z',
        xpEarned: 100,
      },
    },
  })

  it('preserves fractional (partial-credit) scores to 2 decimals', () => {
    const p = migrateProgress(makeRaw(87.89))
    expect(p.quizScores.introduction.score).toBe(87.89)
    expect(p.quizScores.introduction.passed).toBe(true) // >= 75
  })

  it('rounds long decimals to 2 places', () => {
    const p = migrateProgress(makeRaw(87.899))
    expect(p.quizScores.introduction.score).toBe(87.9)
  })

  it('clamps out-of-range scores', () => {
    expect(migrateProgress(makeRaw(150)).quizScores.introduction.score).toBe(100)
    expect(migrateProgress(makeRaw(-5)).quizScores.introduction.score).toBe(0)
  })

  it('ignores unknown module ids', () => {
    const p = migrateProgress({ quizScores: { bogus: { score: 90 } } })
    expect(p.quizScores.bogus).toBeUndefined()
  })
})
