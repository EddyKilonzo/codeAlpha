"use client"

import { useCallback } from 'react'
import { useProgressContext } from '@/context/ProgressContext'
import { migrateProgress } from '@/lib/progressUtils'
import { STORAGE_KEY } from '@/lib/constants'
import type { QuizScore } from '@/types'

export function useProgress() {
  const { state, dispatch, isHydrated, pendingNotifications, clearNotification } = useProgressContext()

  const addXP = useCallback((amount: number) =>
    dispatch({ type: 'ADD_XP', payload: { amount } }), [dispatch])

  const unlockModule = useCallback((moduleId: string) =>
    dispatch({ type: 'UNLOCK_MODULE', payload: { moduleId } }), [dispatch])

  const completeModule = useCallback((moduleId: string) =>
    dispatch({ type: 'COMPLETE_MODULE', payload: { moduleId } }), [dispatch])

  const saveQuizScore = useCallback((score: QuizScore) => {
    dispatch({ type: 'SAVE_QUIZ_SCORE', payload: score })
    const noPreviousPasses = Object.values(state.quizScores).every((s) => !s.passed)
    if (score.passed && noPreviousPasses) {
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: { achievementId: 'quiz-champion' } })
    }
    if (score.score === 100) {
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: { achievementId: 'perfect-score' } })
    }
  }, [dispatch, state.quizScores])

  const unlockAchievement = useCallback((achievementId: string) =>
    dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: { achievementId } }), [dispatch])

  const updateStreak = useCallback(() =>
    dispatch({ type: 'UPDATE_STREAK' }), [dispatch])

  const setUserName = useCallback((name: string) =>
    dispatch({ type: 'SET_USERNAME', payload: { name } }), [dispatch])

  const setCertificateId = useCallback((id: string) =>
    dispatch({ type: 'SET_CERTIFICATE_ID', payload: { id } }), [dispatch])

  const setLastActive = useCallback((moduleId: string, tab: string) =>
    dispatch({ type: 'SET_LAST_ACTIVE', payload: { moduleId, tab } }), [dispatch])

  const markLessonViewed = useCallback((moduleId: string) => {
    const alreadyViewed = !!state.lessonViewedAt[moduleId]
    dispatch({ type: 'MARK_LESSON_VIEWED', payload: { moduleId } })
    if (!alreadyViewed && Object.keys(state.lessonViewedAt).length === 0) {
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: { achievementId: 'first-steps' } })
    }
  }, [dispatch, state.lessonViewedAt])

  const markVoiceComplete = useCallback((moduleId: string) =>
    dispatch({ type: 'MARK_VOICE_COMPLETE', payload: { moduleId } }), [dispatch])

  const setFlashcardKnown = useCallback((moduleId: string, cardId: string) =>
    dispatch({ type: 'SET_FLASHCARD_KNOWN', payload: { moduleId, cardId } }), [dispatch])

  const setFlashcardReview = useCallback((moduleId: string, cardId: string) =>
    dispatch({ type: 'SET_FLASHCARD_REVIEW', payload: { moduleId, cardId } }), [dispatch])

  const completeFlashcards = useCallback((moduleId: string) => {
    dispatch({ type: 'COMPLETE_FLASHCARDS', payload: { moduleId } })
    const anyPrevCompleted = Object.values(state.flashcardProgress).some((fp) => fp.completed)
    if (!anyPrevCompleted) {
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: { achievementId: 'card-master' } })
    }
  }, [dispatch, state.flashcardProgress])

  const checkStreakAchievements = useCallback((newStreak: number) => {
    if (newStreak >= 3) dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: { achievementId: 'streak-starter' } })
    if (newStreak >= 7) dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: { achievementId: 'streak-warrior' } })
  }, [dispatch])

  const checkModuleAchievements = useCallback((completedCount: number) => {
    if (completedCount >= 3) dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: { achievementId: 'halfway-there' } })
    if (completedCount >= 6) dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: { achievementId: 'course-complete' } })
  }, [dispatch])

  const checkXPAchievements = useCallback((xp: number) => {
    if (xp >= 700) dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: { achievementId: 'high-achiever' } })
  }, [dispatch])

  const isModuleUnlocked = useCallback((moduleId: string) =>
    state.unlockedModules.includes(moduleId), [state.unlockedModules])

  const isModuleCompleted = useCallback((moduleId: string) =>
    state.completedModules.includes(moduleId), [state.completedModules])

  const getQuizScore = useCallback((moduleId: string) =>
    state.quizScores[moduleId] ?? null, [state.quizScores])

  const isAchievementUnlocked = useCallback((achievementId: string) =>
    state.achievements.some((a) => a.id === achievementId && a.unlockedAt !== null), [state.achievements])

  const overallProgress = useCallback(() =>
    Math.round((state.completedModules.length / 6) * 100), [state.completedModules])

  // Download the current progress (incl. certificate name/id) as a JSON backup —
  // guards against losing everything when the browser cache/localStorage is cleared.
  const exportProgress = useCallback((): { ok: boolean; error?: string } => {
    try {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `phishshield-progress-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      return { ok: true }
    } catch {
      return { ok: false, error: 'Could not export your progress.' }
    }
  }, [state])

  // Restore from a backup file. We sanitise via migrateProgress, write straight to
  // storage and reload so hydration re-runs cleanly (no achievement toast storm).
  const importProgress = useCallback((json: string): { ok: boolean; error?: string } => {
    try {
      const parsed = JSON.parse(json)
      if (!parsed || typeof parsed !== 'object') throw new Error('bad')
      const migrated = migrateProgress(parsed)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))
      window.location.reload()
      return { ok: true }
    } catch {
      return { ok: false, error: 'That file isn’t a valid PhishShield backup.' }
    }
  }, [])

  return {
    progress: state,
    isHydrated,
    pendingNotifications,
    clearNotification,
    addXP,
    unlockModule,
    completeModule,
    saveQuizScore,
    unlockAchievement,
    updateStreak,
    setUserName,
    setCertificateId,
    setLastActive,
    markLessonViewed,
    markVoiceComplete,
    setFlashcardKnown,
    setFlashcardReview,
    completeFlashcards,
    checkStreakAchievements,
    checkModuleAchievements,
    checkXPAchievements,
    isModuleUnlocked,
    isModuleCompleted,
    getQuizScore,
    isAchievementUnlocked,
    overallProgress,
    exportProgress,
    importProgress,
  }
}
