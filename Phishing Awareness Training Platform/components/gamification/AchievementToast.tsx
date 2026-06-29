"use client"

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Trophy, Star, Layers, Flame, Zap, TrendingUp, Monitor,
  Brain, Timer, ShieldCheck, Award, Footprints, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Achievement } from '@/types'

const ICON_MAP: Record<string, React.ElementType> = {
  Trophy, Star, Layers, Flame, Zap, TrendingUp, Monitor,
  Brain, Timer, ShieldCheck, Award, Footprints,
}

interface Props {
  achievement: Achievement
  onDismiss: () => void
}

export function AchievementToast({ achievement, onDismiss }: Props) {
  const Icon = ICON_MAP[achievement.icon] ?? Trophy

  useEffect(() => {
    const t = setTimeout(onDismiss, 5000)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.92 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.92, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="relative flex items-start gap-3 w-80 rounded-2xl border border-amber-200/80 dark:border-amber-700/40 bg-white/98 dark:bg-zinc-900/98 shadow-xl shadow-black/10 backdrop-blur-md overflow-hidden p-4"
    >
      {/* Shimmer accent */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-50/60 via-transparent to-transparent dark:from-amber-900/10" />

      {/* Icon badge */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 500, damping: 20 }}
        className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-md"
      >
        <Icon className="h-5 w-5 text-white" />
      </motion.div>

      {/* Content */}
      <div className="relative flex-1 min-w-0 space-y-0.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
          Achievement Unlocked
        </p>
        <p className="text-sm font-bold text-foreground truncate">{achievement.title}</p>
        <p className="text-xs text-muted-foreground leading-snug line-clamp-2">{achievement.description}</p>
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xs font-bold text-amber-600 dark:text-amber-400 pt-0.5"
        >
          +{achievement.xpReward} XP
        </motion.p>
      </div>

      {/* Dismiss */}
      <button
        onClick={onDismiss}
        className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {/* Auto-dismiss progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-amber-400/60 dark:bg-amber-500/40"
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 5, ease: 'linear' }}
      />
    </motion.div>
  )
}

interface LevelUpToastProps {
  level: number
  title: string
  onDismiss: () => void
}

export function LevelUpToast({ level, title, onDismiss }: LevelUpToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.92 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.92, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="relative flex items-start gap-3 w-80 rounded-2xl border border-brand/30 bg-white/98 dark:bg-zinc-900/98 shadow-xl shadow-black/10 backdrop-blur-md overflow-hidden p-4"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-transparent" />

      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 500, damping: 20 }}
        className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-light shadow-md"
      >
        <span className="text-lg font-black text-white leading-none">{level}</span>
      </motion.div>

      <div className="relative flex-1 min-w-0 space-y-0.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-brand">
          Level Up!
        </p>
        <p className="text-sm font-bold text-foreground">Level {level} — {title}</p>
        <p className="text-xs text-muted-foreground">Keep learning to reach the next rank.</p>
      </div>

      <button
        onClick={onDismiss}
        className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-brand/40"
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 5, ease: 'linear' }}
      />
    </motion.div>
  )
}

interface ModuleCompleteToastProps {
  moduleTitle: string
  onDismiss: () => void
}

export function ModuleCompleteToast({ moduleTitle, onDismiss }: ModuleCompleteToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.92 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.92, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="relative flex items-start gap-3 w-80 rounded-2xl border border-brand/30 bg-white/98 dark:bg-zinc-900/98 shadow-xl shadow-black/10 backdrop-blur-md overflow-hidden p-4"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-transparent" />

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 500, damping: 20 }}
        className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-emerald-500 shadow-md"
      >
        <ShieldCheck className="h-5 w-5 text-white" />
      </motion.div>

      <div className="relative flex-1 min-w-0 space-y-0.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-brand">
          Module Complete
        </p>
        <p className="text-sm font-bold text-foreground truncate">{moduleTitle}</p>
        <p className="text-xs text-muted-foreground">Next module is now unlocked.</p>
      </div>

      <button
        onClick={onDismiss}
        className={cn('relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors')}
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-brand/40"
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 5, ease: 'linear' }}
      />
    </motion.div>
  )
}
