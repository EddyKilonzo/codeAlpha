"use client"

import { useState, useEffect, useRef, useCallback } from 'react'

export const SPEECH_RATES = [0.75, 1, 1.25, 1.5, 2] as const
export type SpeechRate = typeof SPEECH_RATES[number]

export interface UseSpeechReturn {
  isSupported: boolean
  isPlaying: boolean
  isPaused: boolean
  hasAudioStarted: boolean
  playGeneration: number
  isMuted: boolean
  volume: number
  rate: SpeechRate
  wordIndex: number
  words: string[]
  estimatedSeconds: number
  availableVoices: SpeechSynthesisVoice[]
  selectedVoice: SpeechSynthesisVoice | null
  play: () => void
  pause: () => void
  resume: () => void
  replay: () => void
  skip: () => void
  setRate: (r: SpeechRate) => void
  setVolume: (v: number) => void
  setVoice: (voice: SpeechSynthesisVoice) => void
  toggleMute: () => void
}

const PREFERRED_VOICES = [
  'Google UK English Female',
  'Microsoft Jenny Online (Natural) - English (United States)',
  'Microsoft Aria Online (Natural) - English (United States)',
  'Microsoft Zira - English (United States)',
  'Google US English',
  'Samantha',
  'Karen',
  'Daniel',
  'Alex',
]

export function useSpeech(text: string, onComplete?: () => void): UseSpeechReturn {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [hasAudioStarted, setHasAudioStarted] = useState(false)
  const [playGeneration, setPlayGeneration] = useState(0)
  const [volume, setVolumeState] = useState(1)
  const [rate, setRateState] = useState<SpeechRate>(1)
  const [wordIndex, setWordIndex] = useState(0)
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoiceState] = useState<SpeechSynthesisVoice | null>(null)

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)
  const volumeRef = useRef(1)
  const savedVolumeRef = useRef(1) // restored when unmuting
  const rateRef = useRef<SpeechRate>(1)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  // Identity-based guard: onend only calls completion for the CURRENT active utterance.
  // Replaces the old boolean isCancelledRef which could be reset by the first spurious
  // onend from cancel(), allowing a second Windows-TTS delayed onend to slip through
  // and reset pausedAtCharRef to 0 — causing resume to restart from the beginning.
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Character/time position tracking for pause-resume (Windows TTS doesn't fire onboundary)
  const charIndexRef = useRef(0)
  const pausedAtCharRef = useRef(0)
  const segmentFromCharRef = useRef(0)
  const segmentStartMsRef = useRef<number | null>(null)

  const words = text.split(/\s+/).filter(Boolean)
  const estimatedSeconds = Math.round((words.length / 150) * 60)
  const isMuted = volume === 0

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

  useEffect(() => {
    if (!isSupported) return
    const pickVoice = (voices: SpeechSynthesisVoice[]) => {
      if (!voices.length) return null
      for (const name of PREFERRED_VOICES) {
        const match = voices.find(v => v.name.includes(name))
        if (match) return match
      }
      return voices.find(v => v.lang.startsWith('en-')) ?? voices[0] ?? null
    }
    const applyVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      if (!voices.length) return
      const englishVoices = voices.filter(v => v.lang.startsWith('en'))
      setAvailableVoices(englishVoices)
      if (!voiceRef.current) {
        const best = pickVoice(voices)
        voiceRef.current = best
        setSelectedVoiceState(best)
      }
    }
    applyVoices()
    window.speechSynthesis.onvoiceschanged = applyVoices
    return () => { window.speechSynthesis.onvoiceschanged = null }
  }, [isSupported])

  const buildUtteranceFrom = useCallback((fromChar: number) => {
    const slice = text.slice(fromChar)
    const u = new SpeechSynthesisUtterance(slice)
    u.rate = rateRef.current
    u.volume = volumeRef.current
    u.pitch = 1.05
    u.lang = 'en-US'
    if (voiceRef.current) u.voice = voiceRef.current

    u.onstart = () => {
      if (activeUtteranceRef.current !== u) return
      // Record actual audio-start time (may be 500ms–2s after speak() on Windows TTS)
      segmentStartMsRef.current = Date.now()
      setHasAudioStarted(true)
    }
    u.onboundary = (e) => {
      if (e.name === 'word') {
        const absolute = fromChar + e.charIndex
        charIndexRef.current = absolute
        const count = text.slice(0, absolute).split(/\s+/).filter(Boolean).length
        setWordIndex(count)
      }
    }
    u.onend = () => {
      if (activeUtteranceRef.current !== u) return
      activeUtteranceRef.current = null
      setIsPlaying(false)
      setIsPaused(false)
      setWordIndex(words.length)
      charIndexRef.current = 0
      pausedAtCharRef.current = 0
      onCompleteRef.current?.()
    }
    u.onerror = () => {
      if (activeUtteranceRef.current !== u) return
      activeUtteranceRef.current = null
      setIsPlaying(false)
      setIsPaused(false)
    }
    return u
  }, [text, words.length])

  useEffect(() => {
    return () => {
      activeUtteranceRef.current = null
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // Chrome/Windows heartbeat: Chrome silently cancels long utterances after ~15 s.
  // Detect and restart from the estimated char position to keep playback alive.
  useEffect(() => {
    if (!isSupported || !isPlaying) return
    const id = setInterval(() => {
      if (
        !window.speechSynthesis.speaking &&
        !window.speechSynthesis.pending &&
        activeUtteranceRef.current !== null
      ) {
        const elapsed = segmentStartMsRef.current != null ? Date.now() - segmentStartMsRef.current : 0
        const segText = text.slice(segmentFromCharRef.current)
        const segWords = segText.split(/\s+/).filter(Boolean).length
        const totalMs = Math.max(1, (segWords / 150) * 60000 / rateRef.current)
        const fraction = Math.min(0.98, elapsed / totalMs)
        const fromChar = segmentFromCharRef.current + Math.round(fraction * segText.length)
        const u = buildUtteranceFrom(fromChar)
        utteranceRef.current = u
        activeUtteranceRef.current = u
        segmentFromCharRef.current = fromChar
        window.speechSynthesis.speak(u)
        segmentStartMsRef.current = Date.now()
      }
    }, 12000)
    return () => clearInterval(id)
  }, [isSupported, isPlaying, text, buildUtteranceFrom])

  const estimateCharPosition = useCallback(() => {
    if (charIndexRef.current > segmentFromCharRef.current) {
      return charIndexRef.current
    }
    const elapsedMs = segmentStartMsRef.current != null ? Date.now() - segmentStartMsRef.current : 0
    const segText = text.slice(segmentFromCharRef.current)
    const segWords = segText.split(/\s+/).filter(Boolean).length
    const totalMs = Math.max(1, (segWords / 150) * 60000 / rateRef.current)
    const fraction = Math.min(0.98, elapsedMs / totalMs)
    return segmentFromCharRef.current + Math.round(fraction * segText.length)
  }, [text])

  // Restart utterance from current position with new volume/rate applied.
  const restartFromPosition = useCallback(() => {
    const fromChar = estimateCharPosition()
    activeUtteranceRef.current = null
    window.speechSynthesis.cancel()
    segmentFromCharRef.current = fromChar
    segmentStartMsRef.current = null  // onstart sets the real clock
    setHasAudioStarted(false)
    const u = buildUtteranceFrom(fromChar)
    utteranceRef.current = u
    activeUtteranceRef.current = u
    window.speechSynthesis.speak(u)
  }, [estimateCharPosition, buildUtteranceFrom])

  const play = useCallback(() => {
    if (!isSupported) return
    activeUtteranceRef.current = null
    window.speechSynthesis.cancel()
    charIndexRef.current = 0
    pausedAtCharRef.current = 0
    segmentFromCharRef.current = 0
    segmentStartMsRef.current = null  // onstart sets the real clock
    setWordIndex(0)
    setHasAudioStarted(false)
    setPlayGeneration(g => g + 1)  // signals fresh play (not resume) to the component
    const u = buildUtteranceFrom(0)
    utteranceRef.current = u
    activeUtteranceRef.current = u
    window.speechSynthesis.speak(u)
    setIsPlaying(true)
    setIsPaused(false)
  }, [isSupported, buildUtteranceFrom])

  const pause = useCallback(() => {
    if (!isSupported || !isPlaying) return
    pausedAtCharRef.current = estimateCharPosition()
    activeUtteranceRef.current = null
    window.speechSynthesis.cancel()
    segmentStartMsRef.current = null
    setIsPlaying(false)
    setIsPaused(true)
  }, [isSupported, isPlaying, estimateCharPosition])

  const resume = useCallback(() => {
    if (!isSupported || !isPaused) return
    segmentFromCharRef.current = pausedAtCharRef.current
    segmentStartMsRef.current = null  // onstart sets the real clock
    setHasAudioStarted(false)
    const u = buildUtteranceFrom(pausedAtCharRef.current)
    utteranceRef.current = u
    activeUtteranceRef.current = u
    window.speechSynthesis.speak(u)
    setIsPlaying(true)
    setIsPaused(false)
  }, [isSupported, isPaused, buildUtteranceFrom])

  const replay = useCallback(() => {
    charIndexRef.current = 0
    pausedAtCharRef.current = 0
    play()
  }, [play])

  const skip = useCallback(() => {
    if (!isSupported) return
    activeUtteranceRef.current = null
    window.speechSynthesis.cancel()
    setIsPlaying(false)
    setIsPaused(false)
    setWordIndex(words.length)
    charIndexRef.current = 0
    pausedAtCharRef.current = 0
    onCompleteRef.current?.()
  }, [isSupported, words.length])

  const setRate = useCallback((r: SpeechRate) => {
    rateRef.current = r
    setRateState(r)
    if (isPlaying) restartFromPosition()
  }, [isPlaying, restartFromPosition])

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v))
    volumeRef.current = clamped
    setVolumeState(clamped)
    if (clamped > 0) savedVolumeRef.current = clamped
    if (isPlaying) restartFromPosition()
  }, [isPlaying, restartFromPosition])

  const toggleMute = useCallback(() => {
    if (volumeRef.current === 0) {
      setVolume(savedVolumeRef.current > 0 ? savedVolumeRef.current : 1)
    } else {
      setVolume(0)
    }
  }, [setVolume])

  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    voiceRef.current = voice
    setSelectedVoiceState(voice)
    if (isPlaying) restartFromPosition()
  }, [isPlaying, restartFromPosition])

  return {
    isSupported,
    isPlaying,
    isPaused,
    hasAudioStarted,
    playGeneration,
    isMuted,
    volume,
    rate,
    wordIndex,
    words,
    estimatedSeconds,
    availableVoices,
    selectedVoice,
    play,
    pause,
    resume,
    replay,
    skip,
    setRate,
    setVolume,
    setVoice,
    toggleMute,
  }
}
