"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, CreditCard, Swords, GraduationCap, Lock, CheckCircle2, Clock, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useProgress } from '@/hooks/useProgress'
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
import { CaseStudyCard } from '@/components/case-studies/CaseStudyCard'

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
  const { isHydrated, isModuleUnlocked, isModuleCompleted, getQuizScore, markLessonViewed, progress, checkModuleAchievements } = useProgress()
  const [activeTab, setActiveTab] = useState<Tab>('lesson')
  const [quizDone, setQuizDone] = useState(false)
  const [preVoiceDone, setPreVoiceDone] = useState(false)
  const [showPostVoice, setShowPostVoice] = useState(false)

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
    }
  }, [isHydrated, isUnlocked, module.id, markLessonViewed])

  useEffect(() => {
    if (quizScore?.passed) setQuizDone(true)
  }, [quizScore])

  // Skip pre-quiz voice if module is already completed
  useEffect(() => {
    if (isCompleted) setPreVoiceDone(true)
  }, [isCompleted])

  if (!isHydrated) return null

  if (!isUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Module Locked</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-xs">
          Complete the previous module to unlock {module.title}.
        </p>
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
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Module header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-foreground">{module.title}</h1>
          {isCompleted && (
            <Badge className="bg-brand/10 text-brand border-brand/30 gap-1">
              <CheckCircle2 className="h-3 w-3" /> Completed
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{module.description}</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> ~{module.estimatedMinutes} min</span>
          <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-brand" /> +{module.xpReward} XP on completion</span>
          {quizScore && (
            <span className="flex items-center gap-1 text-brand font-medium">
              <GraduationCap className="h-3 w-3" /> Quiz: {quizScore.score}%
            </span>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-0 border-b border-border overflow-x-auto -mx-0">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap -mb-px',
                activeTab === tab.id
                  ? 'border-brand text-brand'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {tab.count && (
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                  {tab.count}
                </span>
              )}
              {tab.badge && (
                <span className="rounded-full bg-brand/10 text-brand px-1.5 py-0.5 text-[10px] font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
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
                    <div className="rounded-xl border border-brand/20 bg-brand/5 p-5 space-y-3">
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
                  onClick={() => setActiveTab('flashcards')}
                  className="inline-flex items-center gap-2 rounded-lg bg-brand/10 border border-brand/30 px-4 py-2.5 text-sm font-medium text-brand hover:bg-brand/20 transition-colors"
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
                      onClick={() => setActiveTab(simulations.length > 0 ? 'simulations' : 'quiz')}
                      className="inline-flex items-center gap-2 rounded-lg bg-brand/10 border border-brand/30 px-4 py-2.5 text-sm font-medium text-brand hover:bg-brand/20 transition-colors"
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
                      onClick={() => setActiveTab('quiz')}
                      className="inline-flex items-center gap-2 rounded-lg bg-brand/10 border border-brand/30 px-4 py-2.5 text-sm font-medium text-brand hover:bg-brand/20 transition-colors"
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
                  <QuizEngine
                    quiz={quiz}
                    onComplete={() => {
                      setQuizDone(true)
                      setShowPostVoice(true)
                      checkModuleAchievements(progress.completedModules.length)
                    }}
                  />
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
