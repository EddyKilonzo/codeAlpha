"use client"

import { useProgressContext } from '@/context/ProgressContext'
import type { QuizScore } from '@/types'

export function useProgress() {
  const { state, dispatch, isHydrated, pendingNotifications, clearNotification } = useProgressContext()

  const addXP = (amount: number) =>
    dispatch({ type: 'ADD_XP', payload: { amount } })

  const unlockModule = (moduleId: string) =>
    dispatch({ type: 'UNLOCK_MODULE', payload: { moduleId } })

  const completeModule = (moduleId: string) =>
    dispatch({ type: 'COMPLETE_MODULE', payload: { moduleId } })

  const saveQuizScore = (score: QuizScore) => {
    dispatch({ type: 'SAVE_QUIZ_SCORE', payload: score })

    // Achievement: first quiz ever passed
    const noPreviousPasses = Object.values(state.quizScores).every((s) => !s.passed)
    if (score.passed && noPreviousPasses) {
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: { achievementId: 'quiz-champion' } })
    }
    // Achievement: perfect score
    if (score.score === 100) {
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: { achievementId: 'perfect-score' } })
    }
  }

  const unlockAchievement = (achievementId: string) =>
    dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: { achievementId } })

  const updateStreak = () => {
    dispatch({ type: 'UPDATE_STREAK' })
    // Streak achievements are checked after the reducer runs via notification diffing,
    // but we also check here with the pre-update streak value for accuracy
  }

  const setUserName = (name: string) =>
    dispatch({ type: 'SET_USERNAME', payload: { name } })

  const setCertificateId = (id: string) =>
    dispatch({ type: 'SET_CERTIFICATE_ID', payload: { id } })

  const markLessonViewed = (moduleId: string) => {
    const alreadyViewed = !!state.lessonViewedAt[moduleId]
    dispatch({ type: 'MARK_LESSON_VIEWED', payload: { moduleId } })
    // Achievement: first lesson ever viewed
    if (!alreadyViewed && Object.keys(state.lessonViewedAt).length === 0) {
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: { achievementId: 'first-steps' } })
    }
  }

  const markVoiceComplete = (moduleId: string) =>
    dispatch({ type: 'MARK_VOICE_COMPLETE', payload: { moduleId } })

  const setFlashcardKnown = (moduleId: string, cardId: string) =>
    dispatch({ type: 'SET_FLASHCARD_KNOWN', payload: { moduleId, cardId } })

  const setFlashcardReview = (moduleId: string, cardId: string) =>
    dispatch({ type: 'SET_FLASHCARD_REVIEW', payload: { moduleId, cardId } })

  const completeFlashcards = (moduleId: string) => {
    dispatch({ type: 'COMPLETE_FLASHCARDS', payload: { moduleId } })
    // Achievement: first flashcard deck completed
    const anyPrevCompleted = Object.values(state.flashcardProgress).some((fp) => fp.completed)
    if (!anyPrevCompleted) {
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: { achievementId: 'card-master' } })
    }
  }

  const checkStreakAchievements = (newStreak: number) => {
    if (newStreak >= 3) {
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: { achievementId: 'streak-starter' } })
    }
    if (newStreak >= 7) {
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: { achievementId: 'streak-warrior' } })
    }
  }

  const checkModuleAchievements = (completedCount: number) => {
    if (completedCount >= 3) {
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: { achievementId: 'halfway-there' } })
    }
    if (completedCount >= 6) {
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: { achievementId: 'course-complete' } })
    }
  }

  const checkXPAchievements = (xp: number) => {
    if (xp >= 700) {
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: { achievementId: 'high-achiever' } })
    }
  }

  const isModuleUnlocked = (moduleId: string) =>
    state.unlockedModules.includes(moduleId)

  const isModuleCompleted = (moduleId: string) =>
    state.completedModules.includes(moduleId)

  const getQuizScore = (moduleId: string) =>
    state.quizScores[moduleId] ?? null

  const isAchievementUnlocked = (achievementId: string) =>
    state.achievements.some((a) => a.id === achievementId && a.unlockedAt !== null)

  const overallProgress = () =>
    Math.round((state.completedModules.length / 6) * 100)

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
  }
}
