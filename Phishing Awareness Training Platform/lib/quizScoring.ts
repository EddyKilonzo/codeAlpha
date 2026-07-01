/**
 * Pure quiz-scoring helpers. Extracted from the quiz components so the logic is
 * shared (no drift between the engine and the results screen) and unit-testable.
 *
 * Multi-answer questions earn *fractional* credit: getting 4 of 5 correct answers
 * is worth 0.8, not 0. The overall score is the average credit across questions,
 * expressed as a percentage rounded to 2 decimals (e.g. 87.89).
 */

export interface ScorableResult {
  correct: boolean
  /** 0..1 fractional credit; falls back to correct ? 1 : 0 when absent. */
  credit?: number
}

/** Round to at most 2 decimal places, avoiding binary float noise. */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

/**
 * Credit for a single question.
 * @param correct  whether the whole question was answered correctly
 * @param got      correct selections made (multi-answer)
 * @param total    total correct selections available (multi-answer)
 */
export function questionCredit(correct: boolean, got = 0, total = 0): number {
  if (correct) return 1
  if (total > 0 && got > 0) return Math.min(got / total, 1)
  return 0
}

/** Overall percentage score (0..100, 2dp) from per-question results. */
export function computeScore(results: ScorableResult[]): number {
  if (results.length === 0) return 0
  const creditSum = results.reduce(
    (sum, r) => sum + (r.credit ?? (r.correct ? 1 : 0)),
    0
  )
  return round2((creditSum / results.length) * 100)
}
