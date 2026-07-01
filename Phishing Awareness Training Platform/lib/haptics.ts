/**
 * Lightweight haptic feedback helpers built on the Web Vibration API.
 *
 * Vibration is only supported on most mobile browsers (Android/Chrome); it's a
 * no-op on desktop and on iOS Safari, so every call is safely feature-detected
 * and wrapped in a try/catch. Respects the user's reduced-motion preference.
 */

function canVibrate(): boolean {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return false
  if (!('vibrate' in navigator)) return false
  // Honour reduced-motion — users who disable motion generally don't want buzz.
  try {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false
  } catch {
    /* matchMedia unavailable — fall through */
  }
  return true
}

function vibrate(pattern: number | number[]): void {
  if (!canVibrate()) return
  try {
    navigator.vibrate(pattern)
  } catch {
    /* some browsers throw if called without a user gesture — ignore */
  }
}

export const haptics = {
  /** Subtle tick for a correct/positive action. */
  success: () => vibrate(18),
  /** Soft double-tap for a partially-correct answer. */
  warning: () => vibrate([20, 40, 20]),
  /** Firm buzz for a wrong answer / error. */
  error: () => vibrate([50, 40, 60]),
  /** Cancel any ongoing vibration. */
  stop: () => vibrate(0),
}
