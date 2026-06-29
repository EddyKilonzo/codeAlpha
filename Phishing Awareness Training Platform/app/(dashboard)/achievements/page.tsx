"use client"

import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy, Star, Layers, Flame, Zap, TrendingUp, Monitor,
  Brain, Timer, ShieldCheck, Award, Footprints, Lock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProgress } from '@/hooks/useProgress'
import { ACHIEVEMENTS } from '@/data/achievements'
import type { Achievement } from '@/types'

const ICON_MAP: Record<string, React.ElementType> = {
  Trophy, Star, Layers, Flame, Zap, TrendingUp, Monitor,
  Brain, Timer, ShieldCheck, Award, Footprints,
}

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  progress:    { label: 'Progress',    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/50' },
  quiz:        { label: 'Quiz',        color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-200/50 dark:border-violet-800/50' },
  streak:      { label: 'Streak',      color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200/50 dark:border-orange-800/50' },
  exploration: { label: 'Exploration', color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200/50 dark:border-cyan-800/50' },
  mastery:     { label: 'Mastery',     color: 'bg-brand/10 text-brand border-brand/20' },
}

const CATEGORY_ORDER = ['mastery', 'progress', 'quiz', 'streak', 'exploration']

function AchievementCard({ achievement, unlocked }: { achievement: Achievement; unlocked: boolean }) {
  const Icon = ICON_MAP[achievement.icon] ?? Trophy
  const category = CATEGORY_META[achievement.category ?? 'progress']

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'group relative flex flex-col gap-3 rounded-2xl border p-5 transition-all duration-200',
        unlocked
          ? 'bg-card border-border hover:border-brand/30 hover:shadow-[0_0_0_1px_hsl(var(--brand)/0.15),0_4px_16px_hsl(var(--brand)/0.06)] card-lift'
          : 'bg-muted/30 border-border/50 opacity-60 cursor-default select-none'
      )}
    >
      {/* Icon */}
      <div className={cn(
        'relative flex h-11 w-11 items-center justify-center rounded-xl transition-colors overflow-hidden',
        unlocked
          ? 'bg-brand/10 group-hover:bg-brand/15'
          : 'bg-muted'
      )}>
        {unlocked ? (
          <motion.span
            whileHover={{ scale: 1.2, rotate: [0, -8, 8, -4, 0] }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="flex items-center justify-center"
          >
            <Icon className="h-5 w-5 text-brand" />
          </motion.span>
        ) : (
          <Lock className="h-[18px] w-[18px] text-muted-foreground" />
        )}
      </div>

      {/* Text */}
      <div className="space-y-1 min-w-0">
        <p className={cn('text-[13px] font-bold leading-tight', unlocked ? 'text-foreground' : 'text-muted-foreground')}>
          {achievement.title}
        </p>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          {achievement.description}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <span className={cn(
          'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase',
          category.color
        )}>
          {category.label}
        </span>
        <span className={cn(
          'font-mono text-[11px] font-bold',
          unlocked ? 'text-brand' : 'text-muted-foreground/50'
        )}>
          +{achievement.xpReward} XP
        </span>
      </div>

      {/* Unlocked date */}
      {unlocked && achievement.unlockedAt && (
        <div className="absolute top-3 right-3">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand">
            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
              <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      )}

      {/* Locked overlay hint */}
      {!unlocked && (
        <p className="text-[10px] text-muted-foreground/60 italic leading-relaxed">
          {achievement.criteria}
        </p>
      )}
    </motion.div>
  )
}

export default function AchievementsPage() {
  const { progress } = useProgress()
  const unlockedIds = new Set(
    progress.achievements
      .filter((a) => a.unlockedAt !== null)
      .map((a) => a.id)
  )

  const unlockedCount = unlockedIds.size
  const totalCount = ACHIEVEMENTS.length
  const totalXP = ACHIEVEMENTS
    .filter((a) => unlockedIds.has(a.id))
    .reduce((sum, a) => sum + a.xpReward, 0)

  // Group by category in CATEGORY_ORDER
  const grouped = CATEGORY_ORDER.map((cat) => ({
    key: cat,
    meta: CATEGORY_META[cat],
    items: ACHIEVEMENTS.filter((a) => (a.category ?? 'progress') === cat),
  })).filter((g) => g.items.length > 0)

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 sm:py-6 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-extrabold tracking-tight text-foreground"
        >
          Achievements
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-sm text-muted-foreground"
        >
          Track your progress and earn XP rewards
        </motion.p>
      </div>

      {/* Summary stats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="grid grid-cols-3 gap-3 sm:gap-4"
      >
        {[
          { label: 'Unlocked', value: `${unlockedCount}/${totalCount}`, accent: true },
          { label: 'XP from badges', value: `${totalXP} XP`, accent: false },
          { label: 'Completion', value: `${Math.round((unlockedCount / totalCount) * 100)}%`, accent: false },
        ].map(({ label, value, accent }) => (
          <div
            key={label}
            className={cn(
              'rounded-2xl border p-4 text-center',
              accent ? 'bg-brand/[0.06] border-brand/20' : 'bg-card border-border'
            )}
          >
            <div className={cn('font-mono text-xl font-black tabular-nums', accent ? 'text-brand' : 'text-foreground')}>
              {value}
            </div>
            <div className="mt-0.5 text-[11px] font-medium text-muted-foreground">{label}</div>
          </div>
        ))}
      </motion.div>

      {/* Empty state — all locked */}
      {unlockedCount === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-14 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10">
            <Trophy className="h-8 w-8 text-brand opacity-50" />
          </div>
          <div className="space-y-1.5">
            <p className="text-base font-bold text-foreground">No badges earned yet</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Complete lessons, pass quizzes, and maintain streaks to earn achievements.
            </p>
          </div>
        </motion.div>
      )}

      {/* Achievement groups */}
      {grouped.map(({ key, meta, items }) => (
        <section key={key} className="space-y-3">
          <div className="flex items-center gap-2">
            <span className={cn(
              'inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider',
              meta.color
            )}>
              {meta.label}
            </span>
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
              {items.filter((a) => unlockedIds.has(a.id)).length}/{items.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={{
                  ...achievement,
                  unlockedAt: progress.achievements.find((a) => a.id === achievement.id)?.unlockedAt ?? null,
                }}
                unlocked={unlockedIds.has(achievement.id)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
