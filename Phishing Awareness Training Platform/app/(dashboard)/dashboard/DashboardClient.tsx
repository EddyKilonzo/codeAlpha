"use client"

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ShieldAlert, Fish, Crosshair, Zap, FileSearch, ShieldCheck,
  Lock, CheckCircle2, ChevronRight, Clock, Star, Flame,
  Trophy, BookOpen, GraduationCap,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useProgress } from '@/hooks/useProgress'
import { MODULES } from '@/data/modules'
import { getLevelFromXP, getLevelInfo } from '@/lib/levelUtils'
import { CertificateModal } from '@/components/certificate/CertificateModal'
import { useCountUp } from '@/hooks/useCountUp'

const MODULE_ICONS: Record<string, React.ElementType> = {
  ShieldAlert, Fish, Crosshair, Zap, FileSearch, ShieldCheck,
}

const MODULE_GRADIENT: Record<string, string> = {
  introduction: 'from-brand to-emerald-500',
  'types-of-phishing': 'from-blue-500 to-cyan-500',
  'attacker-operations': 'from-orange-500 to-red-500',
  'advanced-threats': 'from-purple-500 to-violet-600',
  'case-studies': 'from-rose-500 to-pink-600',
  'defense-best-practices': 'from-teal-500 to-brand',
}

export function DashboardClient() {
  const { progress, isHydrated, isModuleUnlocked, isModuleCompleted, getQuizScore, updateStreak, checkStreakAchievements, checkXPAchievements } = useProgress()
  const [certOpen, setCertOpen] = useState(false)

  useEffect(() => {
    if (!isHydrated) return
    updateStreak()
    checkStreakAchievements(progress.streak)
    checkXPAchievements(progress.xp)
  }, [isHydrated]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!isHydrated) return null

  const levelInfo = getLevelInfo(getLevelFromXP(progress.xp))
  const totalModules = MODULES.length
  const completedCount = progress.completedModules.length
  const overallPct = Math.round((completedCount / totalModules) * 100)

  // Animated counters
  const animatedXP = useCountUp(progress.xp, 1200)
  const animatedStreak = useCountUp(progress.streak, 800)
  const animatedCompleted = useCountUp(completedCount, 600)

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Welcome header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">
          {progress.userName ? `Welcome back, ${progress.userName}` : 'PhishGuard Training'}
        </h1>
        <p className="text-sm text-muted-foreground">
          Master phishing awareness — one module at a time.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 space-y-1">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-medium text-muted-foreground">Total XP</span>
          </div>
          <p className="text-2xl font-black text-foreground">{animatedXP.toLocaleString()}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-1">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-brand" />
            <span className="text-xs font-medium text-muted-foreground">Level</span>
          </div>
          <div>
            <p className="text-2xl font-black text-foreground">{levelInfo.level}</p>
            <p className="text-[10px] text-brand font-semibold">{levelInfo.title}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-1">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-xs font-medium text-muted-foreground">Streak</span>
          </div>
          <p className="text-2xl font-black text-foreground">{animatedStreak}
            <span className="text-sm font-normal text-muted-foreground ml-1">days</span>
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-1">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-medium text-muted-foreground">Modules</span>
          </div>
          <p className="text-2xl font-black text-foreground">{animatedCompleted}
            <span className="text-sm font-normal text-muted-foreground">/{totalModules}</span>
          </p>
        </div>
      </div>

      {/* Overall progress */}
      {completedCount > 0 && (
        <div className="rounded-xl border border-brand/20 bg-brand/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Overall Progress</span>
            <span className="text-sm font-bold text-brand">{overallPct}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-brand"
              initial={{ width: 0 }}
              animate={{ width: `${overallPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {completedCount} of {totalModules} modules completed
            {progress.certificateEligible && ' — Certificate available!'}
          </p>
        </div>
      )}

      {/* Module grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Modules</h2>
        <div className="space-y-3">
          {MODULES.map((mod, i) => {
            const Icon = MODULE_ICONS[mod.icon] ?? ShieldAlert
            const isUnlocked = isModuleUnlocked(mod.id)
            const isCompleted = isModuleCompleted(mod.id)
            const quizScore = getQuizScore(mod.id)
            const isNext = !isCompleted && isUnlocked
            const gradient = MODULE_GRADIENT[mod.id] ?? 'from-brand to-emerald-500'

            return (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.35, ease: 'easeOut' }}
              >
                {isUnlocked ? (
                  <Link href={`/modules/${mod.id}`}>
                    <div className={cn(
                      'group relative rounded-xl border transition-all duration-200 overflow-hidden',
                      isNext && 'border-brand/40 shadow-sm shadow-brand/10',
                      isCompleted && 'border-brand/20',
                      !isNext && !isCompleted && 'border-border',
                      'hover:shadow-md hover:border-brand/50 cursor-pointer'
                    )}>
                      {/* Gradient top strip */}
                      <div className={cn('h-0.5 w-full bg-gradient-to-r', gradient)} />

                      <div className="flex items-center gap-4 p-4 bg-card">
                        {/* Module icon */}
                        <div className={cn(
                          'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br',
                          gradient
                        )}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-foreground">{mod.title}</span>
                            {isCompleted && (
                              <Badge className="bg-brand/10 text-brand border-brand/30 gap-1 text-[10px]">
                                <CheckCircle2 className="h-2.5 w-2.5" /> Complete
                              </Badge>
                            )}
                            {isNext && !isCompleted && (
                              <Badge className="bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50 text-[10px]">
                                Up Next
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">{mod.description}</p>
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {mod.estimatedMinutes} min</span>
                            <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-500" /> +{mod.xpReward} XP</span>
                            {quizScore && (
                              <span className="flex items-center gap-1 text-brand font-medium">
                                <GraduationCap className="h-3 w-3" /> {quizScore.score}%
                              </span>
                            )}
                          </div>
                        </div>

                        <ChevronRight className={cn(
                          'h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200',
                          'group-hover:translate-x-0.5 group-hover:text-brand'
                        )} />
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className={cn(
                    'rounded-xl border border-border/60 overflow-hidden opacity-60',
                  )}>
                    <div className="h-0.5 w-full bg-muted" />
                    <div className="flex items-center gap-4 p-4 bg-card">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted">
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-muted-foreground">{mod.title}</span>
                          <Badge variant="outline" className="text-[10px]">Locked</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground/60 line-clamp-1">{mod.description}</p>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground/60">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {mod.estimatedMinutes} min</span>
                          <span className="flex items-center gap-1"><Star className="h-3 w-3" /> +{mod.xpReward} XP</span>
                        </div>
                      </div>
                      <Lock className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Certificate eligible */}
      {progress.certificateEligible && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-brand/30 bg-gradient-to-br from-brand/5 to-brand/10 p-6 text-center space-y-3"
        >
          <Trophy className="h-10 w-10 text-brand mx-auto" />
          <div>
            <h3 className="font-bold text-foreground text-lg">Course Complete!</h3>
            <p className="text-sm text-muted-foreground mt-1">
              You have completed all 6 modules. Your certificate of completion is ready.
            </p>
          </div>
          <button
            onClick={() => setCertOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand/90 transition-colors"
          >
            Download Certificate
          </button>
        </motion.div>
      )}

      <CertificateModal open={certOpen} onClose={() => setCertOpen(false)} />
    </div>
  )
}
