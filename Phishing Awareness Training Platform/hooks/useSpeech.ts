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

export function useSpeech(text: string, onComplete?: () => void): UseSpeechReturn {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [rate, setRateState] = useState<SpeechRate>(1)
  const [wordIndex, setWordIndex] = useState(0)

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const isMutedRef = useRef(false)
  const rateRef = useRef<SpeechRate>(1)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const words = text.split(/\s+/).filter(Boolean)
  const estimatedSeconds = Math.round((words.length / 150) * 60) // ~150 WPM

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

  const buildUtterance = useCallback(() => {
    const u = new SpeechSynthesisUtterance(text)
    u.rate = rateRef.current
    u.volume = isMutedRef.current ? 0 : 1
    u.lang = 'en-US'

    u.onboundary = (e) => {
      if (e.name === 'word') {
        const spoken = text.slice(0, e.charIndex)
        const count = spoken.split(/\s+/).filter(Boolean).length
        setWordIndex(count)
      }
    }
    u.onend = () => {
      setIsPlaying(false)
      setIsPaused(false)
      setWordIndex(words.length)
      onCompleteRef.current?.()
    }
    u.onerror = () => {
      setIsPlaying(false)
      setIsPaused(false)
    }
    return u
  }, [text, words.length])

  // Cancel speech on unmount
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
    setWordIndex(0)
    const u = buildUtterance()
    utteranceRef.current = u
    window.speechSynthesis.speak(u)
    setIsPlaying(true)
    setIsPaused(false)
  }, [isSupported, buildUtterance])

  const pause = useCallback(() => {
    if (!isSupported || !isPlaying) return
    window.speechSynthesis.pause()
    setIsPlaying(false)
    setIsPaused(true)
  }, [isSupported, isPlaying])

  const resume = useCallback(() => {
    if (!isSupported || !isPaused) return
    window.speechSynthesis.resume()
    setIsPlaying(true)
    setIsPaused(false)
  }, [isSupported, isPaused])

  const replay = useCallback(() => {
    setWordIndex(0)
    play()
  }, [play])

  const skip = useCallback(() => {
    if (!isSupported) return
    window.speechSynthesis.cancel()
    setIsPlaying(false)
    setIsPaused(false)
    setWordIndex(words.length)
    onCompleteRef.current?.()
  }, [isSupported, words.length])

  const setRate = useCallback((r: SpeechRate) => {
    rateRef.current = r
    setRateState(r)
    // If currently playing, restart with new rate
    if (isPlaying || isPaused) {
      window.speechSynthesis.cancel()
      const u = buildUtterance()
      utteranceRef.current = u
      window.speechSynthesis.speak(u)
      setIsPlaying(true)
      setIsPaused(false)
    }
  }, [isPlaying, isPaused, buildUtterance])

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
