"use client"

import { motion } from 'framer-motion'
import { useProgress } from '@/hooks/useProgress'
import { getProgressToNextLevel } from '@/lib/levelUtils'

export function XPBar() {
  const { progress, isHydrated } = useProgress()

  if (!isHydrated) {
    return (
      <div className="space-y-2 p-4">
        <div className="h-3 w-24 rounded-full bg-muted animate-pulse" />
        <div className="h-2 w-full rounded-full bg-muted animate-pulse" />
        <div className="h-3 w-16 rounded-full bg-muted animate-pulse" />
      </div>
    )
  }

  const levelProgress = getProgressToNextLevel(progress.xp)
  const isMaxLevel = progress.level >= 10

  return (
    <div className="p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-brand">
          Level {progress.level} · {getLevelTitle(progress.level)}
        </span>
        <span className="text-xs font-mono text-muted-foreground">
          {progress.xp} XP
        </span>
      </div>

      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brand to-brand-light"
          initial={{ width: 0 }}
          animate={{ width: `${levelProgress.percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      {!isMaxLevel ? (
        <p className="text-[10px] text-muted-foreground">
          {levelProgress.needed} XP to Level {levelProgress.nextLevel}
        </p>
      ) : (
        <p className="text-[10px] text-brand font-medium">Max level reached!</p>
      )}
    </div>
  )
}

function getLevelTitle(level: number): string {
  const titles: Record<number, string> = {
    1: 'Rookie', 2: 'Learner', 3: 'Aware', 4: 'Vigilant', 5: 'Defender',
    6: 'Analyst', 7: 'Guardian', 8: 'Expert', 9: 'Specialist', 10: 'Cyber Guardian',
  }
  return titles[level] ?? 'Rookie'
}
