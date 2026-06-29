"use client"

import { useState, useEffect, useRef, useCallback } from 'react'

export const SPEECH_RATES = [0.75, 1, 1.25, 1.5, 2] as const
export type SpeechRate = typeof SPEECH_RATES[number]

export interface UseSpeechReturn {
  isSupported: boolean
  isPlaying: boolean
  isPaused: boolean
  isMuted: boolean
  rate: SpeechRate
  wordIndex: number
  words: string[]
  estimatedSeconds: number
  play: () => void
  pause: () => void
  resume: () => void
  replay: () => void
  skip: () => void
  setRate: (r: SpeechRate) => void
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
  const [isMuted, setIsMuted] = useState(false)
  const [rate, setRateState] = useState<SpeechRate>(1)
  const [wordIndex, setWordIndex] = useState(0)

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)
  const isMutedRef = useRef(false)
  const rateRef = useRef<SpeechRate>(1)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  // Track character position for pause/resume (Chrome's native pause is broken)
  const charIndexRef = useRef(0)
  const pausedAtCharRef = useRef(0)

  const words = text.split(/\s+/).filter(Boolean)
  const estimatedSeconds = Math.round((words.length / 150) * 60)

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

  // Pick the most natural-sounding English voice available
  useEffect(() => {
    if (!isSupported) return
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices()
      if (!voices.length) return null
      for (const name of PREFERRED_VOICES) {
        const match = voices.find(v => v.name.includes(name))
        if (match) return match
      }
      return voices.find(v => v.lang.startsWith('en-')) ?? voices[0] ?? null
    }
    voiceRef.current = pickVoice()
    window.speechSynthesis.onvoiceschanged = () => {
      voiceRef.current = pickVoice()
    }
    return () => { window.speechSynthesis.onvoiceschanged = null }
  }, [isSupported])

  // Build an utterance starting from a given character offset in the full text.
  // onboundary offsets are relative to the slice, so we add fromChar back.
  const buildUtteranceFrom = useCallback((fromChar: number) => {
    const slice = text.slice(fromChar)
    const u = new SpeechSynthesisUtterance(slice)
    u.rate = rateRef.current
    u.volume = isMutedRef.current ? 0 : 1
    u.pitch = 1.05
    u.lang = 'en-US'
    if (voiceRef.current) u.voice = voiceRef.current

    u.onboundary = (e) => {
      if (e.name === 'word') {
        const absolute = fromChar + e.charIndex
        charIndexRef.current = absolute
        const count = text.slice(0, absolute).split(/\s+/).filter(Boolean).length
        setWordIndex(count)
      }
    }
    u.onend = () => {
      setIsPlaying(false)
      setIsPaused(false)
      setWordIndex(words.length)
      charIndexRef.current = 0
      pausedAtCharRef.current = 0
      onCompleteRef.current?.()
    }
    u.onerror = () => {
      setIsPlaying(false)
      setIsPaused(false)
    }
    return u
  }, [text, words.length])

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const play = useCallback(() => {
    if (!isSupported) return
    window.speechSynthesis.cancel()
    charIndexRef.current = 0
    pausedAtCharRef.current = 0
    setWordIndex(0)
    const u = buildUtteranceFrom(0)
    utteranceRef.current = u
    window.speechSynthesis.speak(u)
    setIsPlaying(true)
    setIsPaused(false)
  }, [isSupported, buildUtteranceFrom])

  const pause = useCallback(() => {
    if (!isSupported || !isPlaying) return
    // Save current position before cancelling (Chrome's native pause is broken)
    pausedAtCharRef.current = charIndexRef.current
    window.speechSynthesis.cancel()
    setIsPlaying(false)
    setIsPaused(true)
  }, [isSupported, isPlaying])

  const resume = useCallback(() => {
    if (!isSupported || !isPaused) return
    const u = buildUtteranceFrom(pausedAtCharRef.current)
    utteranceRef.current = u
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
    if (isPlaying) {
      // Restart from current position with new rate
      const fromChar = charIndexRef.current
      window.speechSynthesis.cancel()
      const u = buildUtteranceFrom(fromChar)
      utteranceRef.current = u
      window.speechSynthesis.speak(u)
      setIsPlaying(true)
      setIsPaused(false)
    }
    // If paused, pausedAtCharRef is already saved — resume will use new rate
  }, [isPlaying, buildUtteranceFrom])

  const toggleMute = useCallback(() => {
    const next = !isMutedRef.current
    isMutedRef.current = next
    setIsMuted(next)
    if (utteranceRef.current) {
      utteranceRef.current.volume = next ? 0 : 1
    }
  }, [])

  return {
    isSupported,
    isPlaying,
    isPaused,
    isMuted,
    rate,
    wordIndex,
    words,
    estimatedSeconds,
    play,
    pause,
    resume,
    replay,
    skip,
    setRate,
    toggleMute,
  }
}
