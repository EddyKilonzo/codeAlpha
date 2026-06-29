"use client"

import { useEffect, useRef, useState, useMemo } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldAlert, Fish, Crosshair, Zap, FileSearch, ShieldCheck,
  Lock, LockOpen, CheckCircle2, ChevronRight, Clock, Star,
  Trophy, BookOpen, GraduationCap, Flame, PlayCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useProgress } from '@/hooks/useProgress'
import { MODULES } from '@/data/modules'
import { getLevelFromXP, getLevelInfo } from '@/lib/levelUtils'
import { useCountUp } from '@/hooks/useCountUp'

// html2canvas + jsPDF are ~500 kB — load only when user opens the certificate modal
const CertificateModal = dynamic(
  () => import('@/components/certificate/CertificateModal').then(m => ({ default: m.CertificateModal })),
  { ssr: false }
)

const MODULE_ICONS: Record<string, React.ElementType> = {
  ShieldAlert, Fish, Crosshair, Zap, FileSearch, ShieldCheck,
}

// Dashboard skeleton shown before localStorage hydrates
function DashboardSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 sm:py-6 space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-56 rounded-lg bg-muted skeleton" />
        <div className="h-4 w-72 rounded-md bg-muted skeleton" />
      </div>
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-2">
            <div className="h-4 w-16 rounded bg-muted skeleton" />
            <div className="h-8 w-20 rounded-lg bg-muted skeleton" />
          </div>
        ))}
      </div>
      {/* Module list skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-20 rounded bg-muted skeleton" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="h-0.5 w-full bg-muted" />
            <div className="flex items-center gap-4 p-4">
              <div className="h-12 w-12 rounded-xl bg-muted skeleton shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 rounded bg-muted skeleton" />
                <div className="h-3 w-64 rounded bg-muted skeleton" />
                <div className="h-3 w-32 rounded bg-muted skeleton" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DashboardClient() {
  const { progress, isHydrated, isModuleUnlocked, isModuleCompleted, getQuizScore, updateStreak, checkStreakAchievements, checkXPAchievements } = useProgress()
  const [certOpen, setCertOpen] = useState(false)
  const [justUnlockedId, setJustUnlockedId] = useState<string | null>(null)
  const prevUnlockedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!isHydrated) return
    updateStreak()
    checkStreakAchievements(progress.streak)
    checkXPAchievements(progress.xp)
  }, [isHydrated]) // eslint-disable-line react-hooks/exhaustive-deps

  // Detect newly unlocked modules and play unlock animation
  useEffect(() => {
    if (!isHydrated) return
    const currentUnlocked = new Set(MODULES.filter((m) => isModuleUnlocked(m.id)).map((m) => m.id))
    const prev = prevUnlockedRef.current
    if (prev.size > 0) {
      for (const id of currentUnlocked) {
        if (!prev.has(id)) {
          setJustUnlockedId(id)
          const t = setTimeout(() => setJustUnlockedId(null), 2200)
          return () => clearTimeout(t)
        }
      }
    }
    prevUnlockedRef.current = currentUnlocked
  }, [isHydrated, progress.completedModules]) // eslint-disable-line react-hooks/exhaustive-deps

  const totalModules = MODULES.length
  const completedCount = isHydrated ? progress.completedModules.length : 0
  const animatedXP = useCountUp(isHydrated ? progress.xp : 0, 1200, isHydrated)
  const animatedStreak = useCountUp(isHydrated ? progress.streak : 0, 800, isHydrated)
  const animatedCompleted = useCountUp(completedCount, 600, isHydrated)
  const levelInfo = useMemo(() => getLevelInfo(getLevelFromXP(progress.xp)), [progress.xp])
  const overallPct = useMemo(() => Math.round((completedCount / totalModules) * 100), [completedCount, totalModules])
  const resumeModule = useMemo(() =>
    progress.lastActiveModule
      ? MODULES.find((m) => m.id === progress.lastActiveModule && !isModuleCompleted(m.id))
      : null,
    [progress.lastActiveModule, progress.completedModules] // eslint-disable-line react-hooks/exhaustive-deps
  )
  const resumeTab = resumeModule ? (progress.lastActiveTabByModule[resumeModule.id] ?? 'lesson') : null

  if (!isHydrated) return <DashboardSkeleton />

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 sm:py-6 space-y-6 sm:space-y-8">
      {/* Welcome header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          {progress.userName ? `Welcome back, ${progress.userName}` : 'PhishShield Training'}
        </h1>
        <p className="text-sm text-muted-foreground">
          Master phishing awareness — one module at a time.
        </p>
      </div>

      {/* Resume prompt — shown when user left mid-module */}
      {resumeModule && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-brand/25 bg-brand/5 px-4 py-3 flex items-center gap-3 shadow-premium-sm"
        >
          <PlayCircle className="h-5 w-5 text-brand shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">Continue: {resumeModule.title}</p>
            <p className="text-xs text-muted-foreground capitalize">{resumeTab} section</p>
          </div>
          <Link
            href={`/modules/${resumeModule.id}`}
            className="shrink-0 flex items-center gap-1.5 rounded-lg border border-brand text-brand px-3 py-1.5 text-xs font-bold hover:bg-brand/[0.07] transition-colors"
          >
            Resume <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* XP */}
        <div className="card-lift rounded-xl border border-border bg-card p-4 space-y-1 shadow-premium-sm">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-brand" />
            <span className="text-xs font-medium text-muted-foreground">Total XP</span>
          </div>
          <p className="text-2xl font-black font-mono text-foreground">{animatedXP.toLocaleString()}</p>
          <p className="text-[10px] text-brand font-semibold">+XP per module</p>
        </div>

        {/* Level */}
        <div className="card-lift rounded-xl border border-border bg-card p-4 space-y-1 shadow-premium-sm">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-brand" />
            <span className="text-xs font-medium text-muted-foreground">Level</span>
          </div>
          <p className="text-2xl font-black font-mono text-foreground">{levelInfo.level}</p>
          <p className="text-[10px] text-brand font-semibold">{levelInfo.title}</p>
        </div>

        {/* Streak */}
        <div className="card-lift rounded-xl border border-border bg-card p-4 space-y-1 shadow-premium-sm">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-brand" />
            <span className="text-xs font-medium text-muted-foreground">Streak</span>
          </div>
          <p className="text-2xl font-black font-mono text-foreground">
            {animatedStreak}
            <span className="text-sm font-normal font-sans text-muted-foreground ml-1">days</span>
          </p>
        </div>

        {/* Modules */}
        <div className="card-lift rounded-xl border border-border bg-card p-4 space-y-1 shadow-premium-sm">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-brand" />
            <span className="text-xs font-medium text-muted-foreground">Modules</span>
          </div>
          <p className="text-2xl font-black font-mono text-foreground">
            {animatedCompleted}
            <span className="text-sm font-normal font-sans text-muted-foreground">/{totalModules}</span>
          </p>
        </div>
      </div>

      {/* Overall progress */}
      {completedCount > 0 && (
        <div className="rounded-xl border border-brand/20 bg-brand/5 p-4 space-y-3 shadow-premium-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Overall Progress</span>
            <span className="text-sm font-bold text-brand">{overallPct}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-brand to-emerald-400"
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
                      'group relative rounded-xl border card-lift overflow-hidden cursor-pointer shadow-premium-sm',
                      isNext && 'border-brand/40',
                      isCompleted && 'border-brand/20',
                      !isNext && !isCompleted && 'border-border',
                    )}>
                      {/* Pulsing unlock glow — only on the "Up Next" card */}
                      {isNext && (
                        <motion.div
                          className="absolute inset-0 rounded-xl pointer-events-none"
                          animate={{ boxShadow: ['0 0 0 0 rgba(22,163,74,0)', '0 0 0 3px rgba(22,163,74,0.14)', '0 0 0 0 rgba(22,163,74,0)'] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      )}

                      {/* Brand accent top strip */}
                      <div className={cn(
                        'h-0.5 w-full',
                        isCompleted || isNext ? 'bg-brand' : 'bg-muted'
                      )} />

                      <div className="flex items-center gap-4 p-4 bg-card">
                        {/* Module icon — monochromatic */}
                        <div className={cn(
                          'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border overflow-hidden',
                          isCompleted
                            ? 'bg-brand/10 border-brand/20'
                            : isNext
                              ? 'bg-brand/[0.08] border-brand/15'
                              : 'bg-muted border-border'
                        )}>
                          {/* Unlock flash overlay */}
                          {justUnlockedId === mod.id && (
                            <motion.div
                              className="absolute inset-0 bg-brand/20 rounded-xl"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: [0, 0.8, 0] }}
                              transition={{ duration: 0.9, ease: 'easeOut' }}
                            />
                          )}
                          {isCompleted ? (
                            <CheckCircle2 className="h-6 w-6 text-brand" />
                          ) : justUnlockedId === mod.id ? (
                            <AnimatePresence mode="wait">
                              <motion.span
                                key="lock-open"
                                initial={{ scale: 0.6, opacity: 0, rotate: -15 }}
                                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                exit={{ scale: 1.2, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                              >
                                <LockOpen className="h-6 w-6 text-brand" />
                              </motion.span>
                            </AnimatePresence>
                          ) : (
                            <Icon className={cn(
                              'h-6 w-6',
                              isNext ? 'text-brand' : 'text-muted-foreground'
                            )} />
                          )}
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
                              <Badge className="bg-brand/[0.08] text-brand border-brand/25 text-[10px]">
                                Up Next
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">{mod.description}</p>
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {mod.estimatedMinutes} min
                            </span>
                            <span className="flex items-center gap-1 text-brand font-semibold">
                              <Star className="h-3 w-3" /> +{mod.xpReward} XP
                            </span>
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
                  <div className="rounded-xl border border-border/60 overflow-hidden opacity-50">
                    <div className="h-0.5 w-full bg-muted" />
                    <div className="flex items-center gap-4 p-4 bg-card">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted border border-border">
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
                      <Lock className="h-4 w-4 shrink-0 text-muted-foreground/40" />
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
          className="rounded-xl border border-brand/30 bg-brand/5 p-6 text-center space-y-3 shadow-premium-sm"
        >
          <Trophy className="h-10 w-10 text-brand mx-auto" />
          <div>
            <h3 className="font-bold text-foreground text-lg">Course Complete!</h3>
            <p className="text-sm text-muted-foreground mt-1">
              You have completed all 6 modules. Your certificate is ready to download.
            </p>
          </div>
          <Button onClick={() => setCertOpen(true)} size="lg" className="px-8">
            <Trophy className="h-4 w-4" />
            Download Certificate
          </Button>
        </motion.div>
      )}

      <CertificateModal open={certOpen} onClose={() => setCertOpen(false)} />
    </div>
  )
}
