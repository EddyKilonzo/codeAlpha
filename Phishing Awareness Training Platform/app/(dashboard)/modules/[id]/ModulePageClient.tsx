"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { BookOpen, CreditCard, Swords, GraduationCap, Lock, CheckCircle2, Clock, Star, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useProgress } from '@/hooks/useProgress'
import { MODULES } from '@/data/modules'
import { FLASHCARD_DECKS } from '@/data/flashcards'
import { QUIZZES } from '@/data/quizzes'
import { SIMULATIONS } from '@/data/simulations'
import { FlashcardDeck } from '@/components/flashcards/FlashcardDeck'
import { QuizEngine } from '@/components/quiz/QuizEngine'
import { VoiceSummaryPlayer } from '@/components/voice/VoiceSummaryPlayer'
import { OutlookEmailSimulation, GmailSimulation } from '@/components/simulations/EmailSimulation'
import { LoginPageSimulation } from '@/components/simulations/LoginPageSimulation'
import { SMSSimulation } from '@/components/simulations/SMSSimulation'
import { TeamsSimulation } from '@/components/simulations/ChatSimulation'
import { BrowserWarningSimulation } from '@/components/simulations/BrowserWarningSimulation'

// Module content
import { INTRODUCTION_CONTENT, INTRODUCTION_TAKEAWAYS } from '@/data/content/introduction'
import { PHISHING_TYPES_CONTENT, PHISHING_TYPES_TAKEAWAYS } from '@/data/content/types-of-phishing'
import { ATTACKER_OPERATIONS_CONTENT, ATTACKER_OPERATIONS_TAKEAWAYS } from '@/data/content/attacker-operations'
import { ADVANCED_THREATS_CONTENT, ADVANCED_THREATS_TAKEAWAYS } from '@/data/content/advanced-threats'
import { CASE_STUDIES } from '@/data/content/case-studies'
import { DEFENSE_CONTENT, DEFENSE_TAKEAWAYS } from '@/data/content/defense-best-practices'
import { LessonSection } from '@/components/lessons/LessonSection'
import { LessonReadingProgress } from '@/components/lessons/LessonReadingProgress'
import { CaseStudyCard } from '@/components/case-studies/CaseStudyCard'
import { ErrorBoundary } from '@/components/ErrorBoundary'

import type { Module, Simulation } from '@/types'

type Tab = 'lesson' | 'flashcards' | 'simulations' | 'quiz'

const CONTENT_MAP: Record<string, { sections: unknown[]; takeaways?: string[] }> = {
  'introduction': { sections: INTRODUCTION_CONTENT, takeaways: INTRODUCTION_TAKEAWAYS },
  'types-of-phishing': { sections: PHISHING_TYPES_CONTENT, takeaways: PHISHING_TYPES_TAKEAWAYS },
  'attacker-operations': { sections: ATTACKER_OPERATIONS_CONTENT, takeaways: ATTACKER_OPERATIONS_TAKEAWAYS },
  'advanced-threats': { sections: ADVANCED_THREATS_CONTENT, takeaways: ADVANCED_THREATS_TAKEAWAYS },
  'case-studies': { sections: [] },
  'defense-best-practices': { sections: DEFENSE_CONTENT, takeaways: DEFENSE_TAKEAWAYS },
}

function SimulationRenderer({ sim }: { sim: Simulation }) {
  if (sim.type === 'email-outlook') return <OutlookEmailSimulation simulation={sim} />
  if (sim.type === 'email-gmail') return <GmailSimulation simulation={sim} />
  if (sim.type === 'login-page') return <LoginPageSimulation simulation={sim} />
  if (sim.type === 'sms') return <SMSSimulation simulation={sim} />
  if (sim.type === 'teams-message') return <TeamsSimulation simulation={sim} />
  if (sim.type === 'browser-warning') return <BrowserWarningSimulation simulation={sim} />
  return <p className="text-sm text-muted-foreground">Simulation type not implemented yet.</p>
}

interface Props {
  module: Module
}

export function ModulePageClient({ module }: Props) {
  const { isHydrated, isModuleUnlocked, isModuleCompleted, getQuizScore, markLessonViewed, progress, checkModuleAchievements, setLastActive } = useProgress()
  const savedTab = (progress.lastActiveTabByModule[module.id] ?? 'lesson') as Tab
  const [activeTab, setActiveTab] = useState<Tab>(savedTab)
  const [quizDone, setQuizDone] = useState(false)
  const [preVoiceDone, setPreVoiceDone] = useState(false)
  const [showPostVoice, setShowPostVoice] = useState(false)

  const switchTab = (tab: Tab) => {
    setActiveTab(tab)
    setLastActive(module.id, tab)
  }

  const isUnlocked = isModuleUnlocked(module.id)
  const isCompleted = isModuleCompleted(module.id)
  const quizScore = getQuizScore(module.id)
  const flashcards = FLASHCARD_DECKS[module.id] ?? []
  const quiz = QUIZZES[module.id]
  const simulations = SIMULATIONS[module.id] ?? []
  const content = CONTENT_MAP[module.id]
  const flashcardProgress = progress.flashcardProgress[module.id]
  const knownCount = flashcardProgress?.knownIds?.length ?? 0

  useEffect(() => {
    if (isHydrated && isUnlocked) {
      markLessonViewed(module.id)
      setLastActive(module.id, activeTab)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, isUnlocked, module.id])

  useEffect(() => {
    if (quizScore?.passed) setQuizDone(true)
  }, [quizScore])

  // Skip pre-quiz voice if module is already completed
  useEffect(() => {
    if (isCompleted) setPreVoiceDone(true)
  }, [isCompleted])

  if (!isHydrated) return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 sm:py-6 space-y-5">
      {/* Back link */}
      <div className="h-4 w-28 rounded bg-muted skeleton" />
      {/* Module header */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-premium-sm space-y-3">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-xl bg-muted skeleton shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-6 w-56 rounded-lg bg-muted skeleton" />
            <div className="h-4 w-80 rounded bg-muted skeleton" />
            <div className="flex gap-3 pt-1">
              <div className="h-3.5 w-16 rounded bg-muted skeleton" />
              <div className="h-3.5 w-16 rounded bg-muted skeleton" />
            </div>
          </div>
        </div>
        {/* Tab bar skeleton */}
        <div className="flex gap-1 mt-2 border-t border-border pt-3">
          {[80, 72, 96, 56].map((w, i) => (
            <div key={i} className={`h-8 rounded-lg bg-muted skeleton`} style={{ width: w }} />
          ))}
        </div>
      </div>
      {/* Content skeletons */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <div className="h-5 w-44 rounded-lg bg-muted skeleton" />
          <div className="space-y-2">
            <div className="h-3.5 w-full rounded bg-muted skeleton" />
            <div className="h-3.5 w-[92%] rounded bg-muted skeleton" />
            <div className="h-3.5 w-4/5 rounded bg-muted skeleton" />
          </div>
        </div>
      ))}
    </div>
  )

  if (!isUnlocked) {
    const prevModule = MODULES.find((m) => m.order === module.order - 1)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 py-12">
        {/* Decorative grid behind icon */}
        <div className="relative mb-8">
          {/* Subtle radial glow */}
          <div className="absolute inset-0 -m-8 rounded-full bg-gradient-radial from-muted/60 to-transparent opacity-60 blur-2xl" />

          <motion.div
            initial={{ scale: 0, rotate: -12, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22, delay: 0.05 }}
            className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-border bg-card shadow-lg"
          >
            {/* Grid pattern inside icon box */}
            <svg className="absolute inset-0 w-full h-full rounded-3xl opacity-20" xmlns="http://www.w3.org/2000/svg">
              <pattern id="lock-grid" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
                <path d="M 12 0 L 0 0 L 0 12" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-foreground" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#lock-grid)" />
            </svg>
            <Lock className="h-10 w-10 text-muted-foreground/70" />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.35 }}
          className="space-y-3 max-w-sm"
        >
          <h2 className="text-xl font-extrabold tracking-tight text-foreground">Module Locked</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Finish{' '}
            <span className="font-semibold text-foreground">
              {prevModule ? prevModule.title : 'the previous module'}
            </span>{' '}
            to unlock <span className="font-semibold text-foreground">{module.title}</span>.
          </p>

          {prevModule && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
              className="pt-2"
            >
              <Link
                href={`/modules/${prevModule.id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-brand/8 border border-brand/20 px-5 py-2.5 text-[13px] font-semibold text-brand hover:bg-brand/12 transition-colors"
              >
                Continue with {prevModule.title}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    )
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType; count?: string; badge?: string }[] = [
    { id: 'lesson', label: 'Lesson', icon: BookOpen },
    { id: 'flashcards', label: 'Flashcards', icon: CreditCard, count: `${knownCount}/${flashcards.length}` },
    ...(simulations.length > 0 ? [{ id: 'simulations' as Tab, label: 'Simulations', icon: Swords, count: `${simulations.length}` }] : []),
    { id: 'quiz', label: 'Quiz', icon: GraduationCap, badge: quizScore?.passed ? `${quizScore.score}%` : undefined },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 sm:px-6 sm:py-6 space-y-6">
      {/* Module header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl font-extrabold text-foreground tracking-tight">{module.title}</h1>
          {isCompleted && (
            <Badge className="bg-brand/10 text-brand border-brand/20 gap-1 text-[10px] font-bold">
              <CheckCircle2 className="h-2.5 w-2.5" /> Completed
            </Badge>
          )}
        </div>
        <p className="text-[13px] text-muted-foreground leading-relaxed max-w-2xl">{module.description}</p>
        <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> ~{module.estimatedMinutes} min</span>
          <span className="flex items-center gap-1.5 text-brand font-semibold"><Star className="h-3 w-3" /> +{module.xpReward} XP</span>
          {quizScore && (
            <span className="flex items-center gap-1.5 text-brand font-bold">
              <GraduationCap className="h-3 w-3" /> {quizScore.score}% quiz score
            </span>
          )}
        </div>
      </div>

      {/* Tab bar — sticky below header, with reading progress bar */}
      <div className="sticky top-0 z-20 -mx-4 sm:-mx-6 overflow-hidden">
        {activeTab === 'lesson' && <LessonReadingProgress />}
        <div
          className="flex gap-0 border-b border-border/50 overflow-x-auto px-4 sm:px-6"
          style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(16px)' }}
        >
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              className={cn(
                'relative flex items-center gap-2 px-4 py-3 text-[13px] font-medium transition-colors whitespace-nowrap',
                isActive ? 'text-brand' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {tab.count && (
                <span className={cn(
                  'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                  isActive ? 'bg-brand/10 text-brand' : 'bg-muted text-muted-foreground'
                )}>
                  {tab.count}
                </span>
              )}
              {tab.badge && (
                <span className="rounded-full bg-brand/10 text-brand px-1.5 py-0.5 text-[10px] font-bold">
                  {tab.badge}
                </span>
              )}
              {/* Animated underline */}
              {isActive && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-brand"
                  transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                />
              )}
            </button>
          )
        })}
        </div>
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {/* LESSON TAB */}
          {activeTab === 'lesson' && (
            <div className="space-y-6">
              {module.id === 'case-studies' ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Explore real-world phishing attacks. Each case study includes an interactive timeline, attack flow diagram, key lessons, and prevention strategies.
                  </p>
                  {CASE_STUDIES.map((study, i) => (
                    <CaseStudyCard key={study.id} study={study} index={i} />
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {(content?.sections as Parameters<typeof LessonSection>[0]['section'][] ?? []).map((section, i) => (
                    <LessonSection key={(section as { id: string }).id} section={section} index={i} />
                  ))}
                  {content?.takeaways && content.takeaways.length > 0 && (
                    <div className="rounded-xl border border-brand/20 bg-brand/5 p-5 space-y-3 shadow-premium">
                      <h3 className="text-sm font-bold text-brand uppercase tracking-wider">Key Takeaways</h3>
                      <ul className="space-y-2">
                        {content.takeaways.map((t, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-foreground/90">
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-brand mt-0.5" />
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={() => switchTab('flashcards')}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand/8 border border-brand/20 px-5 py-2.5 text-[13px] font-semibold text-brand hover:bg-brand/15 hover:border-brand/30 transition-all duration-150"
                >
                  <CreditCard className="h-4 w-4" />
                  Review Flashcards →
                </button>
              </div>
            </div>
          )}

          {/* FLASHCARDS TAB */}
          {activeTab === 'flashcards' && (
            <div className="space-y-4">
              {flashcards.length > 0 ? (
                <>
                  <FlashcardDeck cards={flashcards} moduleId={module.id} />
                  <div className="pt-2">
                    <button
                      onClick={() => switchTab(simulations.length > 0 ? 'simulations' : 'quiz')}
                      className="inline-flex items-center gap-2 rounded-xl bg-brand/8 border border-brand/20 px-5 py-2.5 text-[13px] font-semibold text-brand hover:bg-brand/15 hover:border-brand/30 transition-all duration-150"
                    >
                      {simulations.length > 0 ? (
                        <><Swords className="h-4 w-4" /> Try Simulations →</>
                      ) : (
                        <><GraduationCap className="h-4 w-4" /> Take the Quiz →</>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No flashcards available for this module.</p>
              )}
            </div>
          )}

          {/* SIMULATIONS TAB */}
          {activeTab === 'simulations' && (
            <div className="space-y-8">
              {simulations.length > 0 ? (
                <>
                  {simulations.map((sim) => (
                    <SimulationRenderer key={sim.id} sim={sim} />
                  ))}
                  <div className="pt-2">
                    <button
                      onClick={() => switchTab('quiz')}
                      className="inline-flex items-center gap-2 rounded-xl bg-brand/8 border border-brand/20 px-5 py-2.5 text-[13px] font-semibold text-brand hover:bg-brand/15 hover:border-brand/30 transition-all duration-150"
                    >
                      <GraduationCap className="h-4 w-4" /> Take the Quiz →
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No simulations available for this module.</p>
              )}
            </div>
          )}

          {/* QUIZ TAB */}
          {activeTab === 'quiz' && (
            <div className="space-y-5">
              {/* Pre-quiz voice summary */}
              {!preVoiceDone && !quizDone && (
                <div className="space-y-3">
                  <VoiceSummaryPlayer
                    moduleId={module.id}
                    phase="pre-quiz"
                    onComplete={() => setPreVoiceDone(true)}
                  />
                  <button
                    onClick={() => setPreVoiceDone(true)}
                    className="w-full py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Skip summary — go straight to quiz
                  </button>
                </div>
              )}

              {/* Quiz engine (shown after pre-voice or on retake) */}
              {(preVoiceDone || quizDone) && (
                quiz ? (
                  <ErrorBoundary>
                    <QuizEngine
                      quiz={quiz}
                      onComplete={() => {
                        setQuizDone(true)
                        setShowPostVoice(true)
                        checkModuleAchievements(progress.completedModules.length)
                      }}
                    />
                  </ErrorBoundary>
                ) : (
                  <p className="text-sm text-muted-foreground">Quiz coming soon for this module.</p>
                )
              )}

              {/* Post-quiz reinforcement */}
              {showPostVoice && quizDone && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <VoiceSummaryPlayer
                    moduleId={module.id}
                    phase="post-quiz"
                  />
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
