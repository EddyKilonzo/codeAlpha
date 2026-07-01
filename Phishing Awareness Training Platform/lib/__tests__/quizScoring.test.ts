import { describe, it, expect } from 'vitest'
import { round2, questionCredit, computeScore } from '@/lib/quizScoring'

describe('round2', () => {
  it('rounds to 2 decimals', () => {
    expect(round2(87.888)).toBe(87.89)
    expect(round2(87.884)).toBe(87.88)
    expect(round2(100)).toBe(100)
    expect(round2(0)).toBe(0)
  })
})

describe('questionCredit', () => {
  it('gives full credit when correct', () => {
    expect(questionCredit(true)).toBe(1)
    expect(questionCredit(true, 3, 5)).toBe(1)
  })
  it('gives fractional credit for partial multi-answer', () => {
    expect(questionCredit(false, 4, 5)).toBe(0.8)
    expect(questionCredit(false, 2, 3)).toBeCloseTo(0.6667, 4)
  })
  it('gives zero when nothing correct', () => {
    expect(questionCredit(false)).toBe(0)
    expect(questionCredit(false, 0, 5)).toBe(0)
  })
  it('never exceeds 1', () => {
    expect(questionCredit(false, 6, 5)).toBe(1)
  })
})

describe('computeScore', () => {
  it('is 100 when all correct', () => {
    expect(computeScore([{ correct: true }, { correct: true }, { correct: true }])).toBe(100)
  })
  it('is 0 for empty', () => {
    expect(computeScore([])).toBe(0)
  })
  it('counts partial credit instead of zero (4 of 5 on one question)', () => {
    const results = [
      { correct: true },
      { correct: true },
      { correct: true },
      { correct: true },
      { correct: false, credit: 0.8 },
    ]
    expect(computeScore(results)).toBe(96)
  })
  it('produces a 2-decimal score for non-round averages', () => {
    const results = [
      { correct: false, credit: 2 / 3 },
      { correct: true },
      { correct: true },
    ]
    // (0.6667 + 1 + 1) / 3 * 100 = 88.89
    expect(computeScore(results)).toBe(88.89)
  })
  it('falls back to the correct flag when credit is absent', () => {
    expect(computeScore([{ correct: true }, { correct: false }])).toBe(50)
  })
})
