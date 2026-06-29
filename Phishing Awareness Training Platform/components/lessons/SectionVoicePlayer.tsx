"use client"

import { useCallback, useState } from 'react'
import { Play, Pause, RotateCcw, Volume2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSpeech } from '@/hooks/useSpeech'
import type { ModuleSection } from '@/data/content/attacker-operations'
import { cn } from '@/lib/utils'

// ── Extract plain text from a section's cards ─────────────────────────────────
function extractSectionText(section: ModuleSection): string {
  const parts: string[] = [section.title + '. ' + section.description]

  for (const card of section.cards) {
    const c = card as unknown as Record<string, unknown>

    if (typeof c.title === 'string') parts.push(c.title + '.')
    if (typeof c.summary === 'string') parts.push(c.summary)
    if (typeof c.detail === 'string') parts.push(c.detail)
    if (typeof c.content === 'string') parts.push(c.content)
    if (typeof c.warning === 'string') parts.push('Warning: ' + c.warning)
    if (typeof c.example === 'string') parts.push('Example: ' + c.example)

    // Comparison left/right
    if (typeof c.left === 'string' && typeof c.right === 'string') {
      parts.push('Comparison. On one side: ' + c.left + '. On the other side: ' + c.right)
    }

    // Items/bullets
    if (Array.isArray(c.items)) {
      for (const item of c.items as unknown[]) {
        if (typeof item === 'string') parts.push(item)
        else if (item && typeof item === 'object') {
          const o = item as Record<string, unknown>
          if (typeof o.label === 'string') parts.push(o.label + (typeof o.description === 'string' ? ': ' + o.description : ''))
        }
      }
    }

    // Steps (diagram-steps)
    if (Array.isArray(c.steps)) {
      let stepNum = 1
      for (const step of c.steps as unknown[]) {
        if (step && typeof step === 'object') {
          const s = step as Record<string, unknown>
          if (typeof s.title === 'string') parts.push('Step ' + stepNum + ': ' + s.title + (typeof s.description === 'string' ? '. ' + s.description : ''))
          stepNum++
        }
      }
    }
  }

  return parts.filter(Boolean).join(' ')
}

// ── Compact waveform bars ─────────────────────────────────────────────────────
function WaveformBars({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="flex items-center gap-[2px] h-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <motion.span
          key={i}
          className="inline-block w-0.5 rounded-full bg-brand"
          animate={isPlaying ? {
            height: ['6px', '10px', '4px', '10px', '6px'],
          } : { height: '4px' }}
          transition={isPlaying ? {
            duration: 0.8,
            delay: i * 0.15,
            repeat: Infinity,
            ease: 'easeInOut',
          } : { duration: 0.2 }}
        />
      ))}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
interface Props {
  section: ModuleSection
}

export function SectionVoicePlayer({ section }: Props) {
  const text = extractSectionText(section)
  const [expanded, setExpanded] = useState(false)
  const { isSupported, isPlaying, isPaused, play, pause, resume, replay, estimatedSeconds } = useSpeech(text)

  const handleToggle = useCallback(() => {
    if (!expanded) { setExpanded(true); play(); return }
    if (isPlaying) { pause(); return }
    if (isPaused) { resume(); return }
    play()
  }, [expanded, isPlaying, isPaused, play, pause, resume])

  const handleReplay = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    replay()
  }, [replay])

  if (!isSupported) return null

  const mins = Math.floor(estimatedSeconds / 60)
  const secs = estimatedSeconds % 60
  const readTime = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`

  return (
    <motion.div
      initial={false}
      className="inline-flex items-center gap-2"
    >
      <div className="relative">
        {/* Active glow ring */}
        {isPlaying && (
          <motion.div
            className="absolute inset-0 rounded-lg bg-brand/20"
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ filter: 'blur(6px)' }}
          />
        )}
        <motion.button
          onClick={handleToggle}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          className={cn(
            'relative group inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[12px] font-semibold transition-colors duration-200',
            isPlaying
              ? 'border-brand/40 bg-brand/10 text-brand'
              : 'border-border bg-card text-muted-foreground hover:border-brand/30 hover:text-brand hover:bg-brand/5'
          )}
          aria-label={isPlaying ? 'Pause audio' : 'Listen to this section'}
        >
        <AnimatePresence mode="wait" initial={false}>
          {isPlaying ? (
            <motion.span
              key="playing"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              className="flex items-center gap-1.5"
            >
              <WaveformBars isPlaying />
              <Pause className="h-3 w-3" />
              <span>Pause</span>
            </motion.span>
          ) : (
            <motion.span
              key="paused"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              className="flex items-center gap-1.5"
            >
              <Volume2 className="h-3 w-3" />
              <span>{isPaused ? 'Resume' : 'Listen'}</span>
              {!isPaused && (
                <span className="text-[10px] text-muted-foreground font-normal">~{readTime}</span>
              )}
            </motion.span>
          )}
        </AnimatePresence>
        </motion.button>
      </div>

      {/* Replay — only visible when active */}
      <AnimatePresence>
        {expanded && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, width: 0 }}
            animate={{ opacity: 1, scale: 1, width: 'auto' }}
            exit={{ opacity: 0, scale: 0.8, width: 0 }}
            onClick={handleReplay}
            className="flex items-center justify-center h-7 w-7 rounded-lg border border-border text-muted-foreground hover:text-brand hover:border-brand/30 transition-colors"
            aria-label="Replay from beginning"
          >
            <RotateCcw className="h-3 w-3" />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
