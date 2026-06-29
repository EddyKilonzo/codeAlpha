"use client"

import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import type { LessonCard } from '@/data/content/attacker-operations'

interface Props {
  card: LessonCard
}

export function StatCard({ card }: Props) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="p-5 border-b border-border flex items-start gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 shrink-0">
          <TrendingUp className="h-4 w-4 text-brand" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{card.title}</p>
          <p className="text-sm text-muted-foreground mt-0.5">{card.summary}</p>
        </div>
      </div>

      {card.detail && (
        <div className="px-5 pt-4 pb-2">
          <p className="text-sm text-foreground/90 leading-relaxed">{card.detail}</p>
        </div>
      )}

      {card.items && card.items.length > 0 && (
        <div className="px-5 pb-5 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {card.items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              viewport={{ once: true }}
              className="flex items-start gap-2 rounded-lg bg-muted/50 px-3 py-2"
            >
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              <span className="text-xs text-foreground/90 leading-relaxed">{item}</span>
            </motion.div>
          ))}
        </div>
      )}

      {card.source && (
        <div className="px-5 pb-4">
          <p className="text-xs text-muted-foreground">Source: {card.source}</p>
        </div>
      )}
    </div>
  )
}
