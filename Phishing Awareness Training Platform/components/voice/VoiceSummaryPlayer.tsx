"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, Pause, RotateCcw, SkipForward, Volume2, Volume1, VolumeX,
  ChevronDown, Clock, Mic, Mic2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSpeech, SPEECH_RATES, type SpeechRate } from '@/hooks/useSpeech'
import { useProgress } from '@/hooks/useProgress'
import { XP_REWARDS } from '@/lib/constants'
import { VOICE_SCRIPTS } from '@/data/voice'

interface Props {
  moduleId: string
  phase: 'pre-quiz' | 'post-quiz'
  onComplete?: () => void
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

const VOICE_NICKNAMES: Record<string, string> = {
  'Google UK English Female': 'Ava · UK',
  'Google UK English Male': 'Oliver · UK',
  'Google US English': 'Ava · US',
  'Jenny': 'Jenny',
  'Aria': 'Aria',
  'Zira': 'Zira',
  'David': 'David',
  'Mark': 'Mark',
  'Guy': 'Guy',
  'Samantha': 'Samantha',
  'Karen': 'Karen · AU',
  'Daniel': 'Daniel · UK',
  'Alex': 'Alex',
  'Moira': 'Moira · IE',
  'Tessa': 'Tessa · ZA',
  'Fiona': 'Fiona · SC',
  'Victoria': 'Victoria',
  'Tom': 'Tom',
  'Siri': 'Siri',
}

function getVoiceNickname(voice: SpeechSynthesisVoice): string {
  // Check exact known names first
  for (const [key, nick] of Object.entries(VOICE_NICKNAMES)) {
    if (voice.name.includes(key)) return nick
  }
  // Strip Microsoft/Google prefixes and suffixes like "Online (Natural) - English (US)"
  return voice.name
    .replace(/^(Microsoft|Google)\s+/i, '')
    .replace(/\s+Online\s*\([^)]+\)/i, '')
    .replace(/\s*-\s*English\s*\([^)]+\)/i, '')
    .trim()
    .split(/\s+/)[0]  // take first word of whatever's left
}

// Animated waveform bars
function Waveform({ active }: { active: boolean }) {
  const bars = [3, 5, 8, 6, 9, 4, 7, 5, 8, 3, 6, 9, 4, 7, 5]
  return (
    <div className="flex items-center gap-0.5 h-8">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full bg-current"
          animate={active ? {
            scaleY: [1, h / 5, 1, h / 7, 1],
          } : { scaleY: 0.3 }}
          transition={active ? {
            duration: 0.8 + (i % 3) * 0.2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.06,
          } : { duration: 0.3 }}
          style={{ height: `${Math.max(h * 3, 6)}px`, originY: 'center' }}
        />
      ))}
    </div>
  )
}

export function VoiceSummaryPlayer({ moduleId, phase, onComplete }: Props) {
  const { markVoiceComplete, addXP, progress } = useProgress()
  const [showTranscript, setShowTranscript] = useState(false)
  const [completed, setCompleted] = useState(
    progress.voiceCompletedModules.includes(moduleId)
  )

  const script = VOICE_SCRIPTS[moduleId]
  const text = script ? (phase === 'pre-quiz' ? script.preQuiz : script.postQuiz) : ''

  const handleComplete = () => {
    if (!completed) {
      setCompleted(true)
      markVoiceComplete(moduleId)
      addXP(XP_REWARDS.VOICE_COMPLETE)
    }
    onComplete?.()
  }

  const speech = useSpeech(text, handleComplete)

  // Local slider state — updates visually on drag, commits to speech only on release
  const [sliderVolume, setSliderVolume] = useState(speech.volume)
  useEffect(() => { setSliderVolume(speech.volume) }, [speech.volume])

  // Tokenise text into [word, whitespace, word, …] for word-level highlighting
  const tokens = text.split(/(\s+)/)
  const transcriptRef = useRef<HTMLDivElement>(null)

  // ── Time-based progress (fallback when onboundary doesn't fire on Windows TTS) ──
  const totalMsRef = useRef(1)
  totalMsRef.current = Math.max(1, (speech.estimatedSeconds / speech.rate) * 1000)
  const playStartRef = useRef<number | null>(null)
  const accMsRef = useRef(0)
  const wasPausedRef = useRef(false)
  const [timePct, setTimePct] = useState(0)

  // Reset timer state on every fresh play() call (not resume).
  // Without this, replaying from a paused state keeps accMsRef from the previous
  // session, causing the highlight to resume from the pause point instead of 0.
  useEffect(() => {
    accMsRef.current = 0
    wasPausedRef.current = false
    playStartRef.current = null
    setTimePct(0)
  }, [speech.playGeneration])

  useEffect(() => {
    if (speech.isPlaying && speech.hasAudioStarted) {
      // Audio is actually playing — start the interval.
      // playGeneration effect resets accMsRef on fresh play; wasPausedRef/isPaused
      // branches saved it on pause/voice-change — so we always continue correctly.
      wasPausedRef.current = false
      playStartRef.current = Date.now()
      const id = setInterval(() => {
        const elapsed = accMsRef.current + (Date.now() - (playStartRef.current ?? Date.now()))
        // Float (not Math.round) so word advances 1 at a time — no 2-word skips
        setTimePct(Math.min(99, (elapsed / totalMsRef.current) * 100))
      }, 50)
      return () => clearInterval(id)
    } else if (speech.isPlaying && !speech.hasAudioStarted) {
      // Restarting mid-play (voice/rate/volume change) or startup latency before
      // onstart fires. Save elapsed time so the highlight continues from the same
      // position when the new utterance starts, instead of resetting to 0.
      wasPausedRef.current = true
      if (playStartRef.current != null) {
        accMsRef.current += Date.now() - playStartRef.current
        playStartRef.current = null
      }
    } else if (speech.isPaused) {
      wasPausedRef.current = true
      if (playStartRef.current != null) {
        accMsRef.current += Date.now() - playStartRef.current
        playStartRef.current = null
      }
    } else {
      // Stopped (ended or skipped) — full reset
      wasPausedRef.current = false
      accMsRef.current = 0
      playStartRef.current = null
      setTimePct(0)
    }
  }, [speech.isPlaying, speech.isPaused, speech.hasAudioStarted])

  const wordBasedPct = speech.words.length > 0
    ? Math.round((speech.wordIndex / speech.words.length) * 100)
    : 0
  const progressPct = Math.max(wordBasedPct, timePct)

  // Effective word index for transcript highlight — prefer accurate onboundary index,
  // fall back to time-based approximation for Windows TTS where onboundary never fires
  const effectiveWordIndex = speech.wordIndex > 0
    ? speech.wordIndex
    : Math.floor((progressPct / 100) * speech.words.length)

  // Auto-scroll the highlighted word into view whenever it advances
  useEffect(() => {
    if (!showTranscript || !transcriptRef.current) return
    const el = transcriptRef.current.querySelector<HTMLElement>('[data-current="true"]')
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [effectiveWordIndex, showTranscript])

  const remaining = Math.round(
    (speech.estimatedSeconds * (1 - progressPct / 100)) / speech.rate
  )

  if (!script) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-brand/20 bg-gradient-to-br from-brand/5 via-background to-background overflow-hidden"
      style={{ boxShadow: 'rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px, rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset' }}
    >
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b border-border/60 px-5 py-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand/10">
          <Mic className="h-4 w-4 text-brand" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-foreground">
            {phase === 'pre-quiz' ? 'Module Summary' : 'Key Takeaways'}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {phase === 'pre-quiz' ? 'Review before the quiz' : 'Reinforce what you learned'}
          </p>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Clock className="h-3 w-3" />
          {speech.isPlaying
            ? `${formatTime(remaining)} left`
            : `~${formatTime(Math.round(speech.estimatedSeconds / speech.rate))}`}
        </div>
      </div>

      {/* Player body */}
      <div className="px-5 py-4 space-y-4">
        {/* Waveform + progress */}
        <div className="space-y-2">
          <div className={cn(
            'flex items-center justify-center h-12',
            speech.isPlaying ? 'text-brand' : 'text-brand/30'
          )}>
            <Waveform active={speech.isPlaying} />
          </div>

          {/* Progress bar */}
          <div className="relative h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-brand"
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.08, ease: 'linear' }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{Math.round(progressPct)}%</span>
            <span>{speech.wordIndex} / {speech.words.length} words</span>
          </div>
        </div>

        {/* Controls — wrap on narrow screens so the speed selector never
            overflows the card edge */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 sm:justify-between">
          {/* Left: volume icon + slider */}
          <div className="flex shrink-0 items-center gap-1.5">
            <motion.button
              type="button"
              onClick={speech.toggleMute}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors"
              aria-label={speech.isMuted ? 'Unmute' : 'Mute'}
            >
              {speech.volume === 0
                ? <VolumeX className="h-4 w-4" />
                : speech.volume < 0.5
                  ? <Volume1 className="h-4 w-4" />
                  : <Volume2 className="h-4 w-4" />}
            </motion.button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={sliderVolume}
              onChange={(e) => setSliderVolume(parseFloat(e.target.value))}
              onPointerUp={(e) => speech.setVolume(parseFloat((e.target as HTMLInputElement).value))}
              className="w-16 h-1 cursor-pointer accent-brand"
              aria-label="Volume"
            />
          </div>

          {/* Center: replay + play/pause + skip */}
          <div className="flex items-center gap-2">
            <motion.button
              type="button"
              onClick={speech.replay}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors"
              aria-label="Replay"
            >
              <RotateCcw className="h-4 w-4" />
            </motion.button>

            {/* Main play/pause button */}
            <motion.button
              type="button"
              onClick={speech.isPlaying ? speech.pause : speech.isPaused ? speech.resume : speech.play}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white shadow-md shadow-brand/30 transition-shadow hover:shadow-brand/50"
              aria-label={speech.isPlaying ? 'Pause' : 'Play'}
            >
              <AnimatePresence mode="wait">
                {speech.isPlaying ? (
                  <motion.span key="pause" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Pause className="h-5 w-5 fill-current" />
                  </motion.span>
                ) : (
                  <motion.span key="play" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Play className="h-5 w-5 fill-current ml-0.5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <motion.button
              type="button"
              onClick={speech.skip}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors"
              aria-label="Skip"
            >
              <SkipForward className="h-4 w-4" />
            </motion.button>
          </div>

          {/* Right: speed selector */}
          <div className="flex shrink-0 items-center gap-0.5">
            {SPEECH_RATES.map((r) => (
              <motion.button
                key={r}
                type="button"
                onClick={() => speech.setRate(r)}
                whileTap={{ scale: 0.9 }}
                className={cn(
                  'rounded px-1.5 py-0.5 text-[10px] font-bold transition-colors',
                  speech.rate === r
                    ? 'bg-brand text-white'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {r}×
              </motion.button>
            ))}
          </div>
        </div>

        {/* Voice picker */}
        {speech.availableVoices.length > 1 && (
          <div className="flex items-center gap-2">
            <Mic2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <div className="relative inline-flex items-center">
              <select
                value={speech.selectedVoice?.name ?? ''}
                onChange={(e) => {
                  const v = speech.availableVoices.find(v => v.name === e.target.value)
                  if (v) speech.setVoice(v)
                }}
                className={cn(
                  'appearance-none cursor-pointer rounded-full border border-border/70',
                  'bg-muted/50 px-3 py-1 pr-6 text-[10px] font-medium text-foreground',
                  'hover:border-brand/50 hover:bg-muted transition-colors outline-none',
                  'focus:border-brand focus:ring-1 focus:ring-brand/30'
                )}
                aria-label="Select voice"
              >
                {speech.availableVoices.map(v => (
                  <option key={v.name} value={v.name}>
                    {getVoiceNickname(v)}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-1.5 h-3 w-3 text-muted-foreground" />
            </div>
          </div>
        )}

        {/* Unsupported fallback */}
        {!speech.isSupported && (
          <p className="text-center text-xs text-muted-foreground py-2">
            Voice playback is not supported in this browser. Read the transcript below.
          </p>
        )}
      </div>

      {/* Transcript toggle */}
      <button
        type="button"
        onClick={() => setShowTranscript((v) => !v)}
        className="w-full flex items-center justify-between border-t border-border/60 px-5 py-3 text-xs text-muted-foreground hover:bg-muted/40 transition-colors"
      >
        <span className="font-medium">Transcript</span>
        <motion.span animate={{ rotate: showTranscript ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-3.5 w-3.5" />
        </motion.span>
      </button>

      <AnimatePresence>
        {showTranscript && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div ref={transcriptRef} className="px-5 pb-5 pt-3 max-h-64 overflow-y-auto">
              <p className="text-xs leading-relaxed whitespace-pre-wrap">
                {(() => {
                  let wordCount = 0
                  return tokens.map((token, i) => {
                    if (/^\s+$/.test(token)) {
                      return <span key={i}>{token}</span>
                    }
                    const idx = wordCount++
                    const isCurrent = (speech.isPlaying || speech.isPaused) && idx === effectiveWordIndex
                    const isPast = (speech.isPlaying || speech.isPaused) && idx < effectiveWordIndex
                    return (
                      <span
                        key={i}
                        data-current={isCurrent ? 'true' : undefined}
                        className={cn(
                          'transition-colors duration-150',
                          isCurrent
                            ? 'text-brand font-semibold'
                            : isPast
                              ? 'text-foreground/35'
                              : 'text-foreground/80'
                        )}
                      >
                        {token}
                      </span>
                    )
                  })
                })()}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
