"use client"

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useCountUp } from '@/hooks/useCountUp'
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
  const animatedXP = useCountUp(achievement.xpReward, 900)

  useEffect(() => {
    const t = setTimeout(onDismiss, 5000)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.88 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.88, transition: { duration: 0.18 } }}
      transition={{ type: 'spring', stiffness: 420, damping: 26 }}
      className="relative flex items-start gap-3 w-80 rounded-2xl border border-brand/25 bg-card shadow-premium-sm backdrop-blur-md overflow-hidden p-4"
    >
      {/* Subtle top border accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent" />

      {/* Icon with pulsing glow ring */}
      <div className="relative shrink-0">
        {/* Glow ring */}
        <motion.div
          className="absolute inset-0 rounded-xl bg-brand/20"
          animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          style={{ filter: 'blur(6px)' }}
        />
        <motion.div
          initial={{ scale: 0, rotate: -25 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.08, type: 'spring', stiffness: 540, damping: 18 }}
          className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-brand/30 bg-brand/[0.08]"
        >
          <Icon className="h-5 w-5 text-brand" />
        </motion.div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-0.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-brand">
          Achievement Unlocked
        </p>
        <p className="text-sm font-bold text-foreground truncate">{achievement.title}</p>
        <p className="text-xs text-muted-foreground leading-snug line-clamp-2">{achievement.description}</p>
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xs font-bold font-mono text-brand pt-0.5"
        >
          +{animatedXP} XP
        </motion.p>
      </div>

      {/* Dismiss */}
      <button
        onClick={onDismiss}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {/* Auto-dismiss progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-brand/40"
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
      className="relative flex items-start gap-3 w-80 rounded-2xl border border-brand/25 bg-card shadow-premium-sm backdrop-blur-md overflow-hidden p-4"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/30 to-transparent" />

      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 500, damping: 20 }}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand/30 bg-brand/[0.08]"
      >
        <span className="text-lg font-black text-brand leading-none">{level}</span>
      </motion.div>

      <div className="flex-1 min-w-0 space-y-0.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-brand">Level Up!</p>
        <p className="text-sm font-bold text-foreground">Level {level} — {title}</p>
        <p className="text-xs text-muted-foreground">Keep going to reach the next rank.</p>
      </div>

      <button
        onClick={onDismiss}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors"
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
      className={cn('relative flex items-start gap-3 w-80 rounded-2xl border border-brand/25 bg-card shadow-premium-sm backdrop-blur-md overflow-hidden p-4')}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/30 to-transparent" />

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 500, damping: 20 }}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand/30 bg-brand/[0.08]"
      >
        <ShieldCheck className="h-5 w-5 text-brand" />
      </motion.div>

      <div className="flex-1 min-w-0 space-y-0.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-brand">Module Complete</p>
        <p className="text-sm font-bold text-foreground truncate">{moduleTitle}</p>
        <p className="text-xs text-muted-foreground">Next module is now unlocked.</p>
      </div>

      <button
        onClick={onDismiss}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors"
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
