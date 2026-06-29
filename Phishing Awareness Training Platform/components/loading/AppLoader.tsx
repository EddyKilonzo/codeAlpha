"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProgress } from '@/hooks/useProgress'

const MESSAGES = [
  'Initializing Training...',
  'Loading Modules...',
  'Preparing Simulations...',
  'Verifying Content...',
  'Almost Ready...',
]

const MIN_MS = 1800

export function AppLoader() {
  const { isHydrated } = useProgress()
  const [visible, setVisible] = useState(true)
  const [ready, setReady] = useState(false)
  const [msgIdx, setMsgIdx] = useState(0)

  // Only show once per browser session
  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('ps_loaded')) {
      setVisible(false)
    }
  }, [])

  // Rotate messages
  useEffect(() => {
    if (!visible) return
    const id = setInterval(() => setMsgIdx((i) => (i + 1) % MESSAGES.length), 620)
    return () => clearInterval(id)
  }, [visible])

  // Track when hydration + minimum display time both complete
  useEffect(() => {
    const minTimer = setTimeout(() => setReady(true), MIN_MS)
    return () => clearTimeout(minTimer)
  }, [])

  useEffect(() => {
    if (isHydrated && ready) {
      sessionStorage.setItem('ps_loaded', '1')
      setVisible(false)
    }
  }, [isHydrated, ready])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="app-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.015 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white overflow-hidden"
          role="status"
          aria-label="Loading PhishShield"
        >
          {/* Layered background */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-[radial-gradient(ellipse,rgba(22,163,74,0.10)_0%,transparent_60%)]" />
            <div
              className="absolute inset-0 opacity-60"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.08) 1.5px, transparent 1.5px)',
                backgroundSize: '26px 26px',
              }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(245,247,250,0.7)_100%)]" />
          </div>

          {/* Shield → Lock → Checkmark logo sequence */}
          <motion.div
            className="relative mb-8"
            initial={{ scale: 0.55, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Ambient pulse glow */}
            <motion.div
              className="absolute inset-0 m-[-24px] rounded-full bg-brand/10"
              style={{ filter: 'blur(20px)' }}
              animate={{ scale: [1, 1.4, 1], opacity: [0.55, 0.12, 0.55] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
            />

            {/* Sharp glow ring that fires after checkmark completes */}
            <motion.div
              className="absolute inset-0 m-[-4px] rounded-full"
              style={{ boxShadow: '0 0 0 2px rgba(22,163,74,0.22), 0 0 32px rgba(22,163,74,0.14)' }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: [0, 1, 0.6], scale: [0.9, 1.05, 1] }}
              transition={{ delay: 1.62, duration: 0.55, ease: 'easeOut' }}
            />

            <svg width="92" height="92" viewBox="0 0 92 92" fill="none" aria-hidden="true">
              {/* Outer decorative ring */}
              <motion.circle
                cx="46" cy="46" r="43"
                stroke="rgba(22,163,74,0.14)"
                strokeWidth="1.5"
                strokeDasharray="4 6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, rotate: 360 }}
                transition={{ opacity: { delay: 0.5, duration: 0.4 }, rotate: { duration: 30, repeat: Infinity, ease: 'linear' } }}
                style={{ originX: '46px', originY: '46px' }}
              />

              {/* Second ring */}
              <motion.circle
                cx="46" cy="46" r="37"
                stroke="rgba(22,163,74,0.08)"
                strokeWidth="1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              />

              {/* Shield fill — fades in before stroke draws */}
              <motion.path
                d="M46 12 L77 22 L77 44 Q77 66 46 78 Q15 66 15 44 L15 22 Z"
                fill="rgba(22,163,74,0.07)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              />

              {/* Shield stroke — draws itself */}
              <motion.path
                d="M46 12 L77 22 L77 44 Q77 66 46 78 Q15 66 15 44 L15 22 Z"
                stroke="#16a34a"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1], delay: 0.28 }}
              />

              {/* ── Lock icon — appears inside shield as it finishes drawing ── */}
              {/* Lock body */}
              <motion.rect
                x="36" y="47" width="20" height="16" rx="2.5"
                fill="none"
                stroke="#16a34a"
                strokeWidth="2"
                strokeLinejoin="round"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: [0, 1, 1, 0], scale: [0.6, 1, 1, 0.8] }}
                transition={{
                  times: [0, 0.15, 0.55, 1],
                  duration: 0.55,
                  delay: 0.85,
                  ease: 'easeOut',
                }}
                style={{ originX: '46px', originY: '55px' }}
              />
              {/* Lock shackle — rises when lock opens */}
              <motion.path
                d="M39 47 L39 41 Q39 34 46 34 Q53 34 53 41 L53 47"
                stroke="#16a34a"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                initial={{ opacity: 0, y: 0 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  y:       [0, 0, -6, -6],
                }}
                transition={{
                  times:    [0, 0.14, 0.52, 1],
                  duration: 0.55,
                  delay:    0.85,
                  ease:     'easeOut',
                }}
              />
              {/* Keyhole dot */}
              <motion.circle
                cx="46" cy="55" r="2.2"
                fill="#16a34a"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 1, 0] }}
                transition={{ times: [0, 0.15, 0.52, 1], duration: 0.55, delay: 0.87 }}
              />

              {/* Checkmark — draws after lock exits */}
              <motion.path
                d="M33 46 L42 55 L60 36"
                stroke="#16a34a"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.42, ease: 'easeOut', delay: 1.5 }}
              />
            </svg>
          </motion.div>

          {/* Brand name */}
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.4 }}
          >
            <p className="text-[23px] font-black tracking-[0.18em] text-foreground">
              PHISHSHIELD
            </p>
            <p className="text-[10px] text-muted-foreground tracking-[0.32em] uppercase mt-1.5 font-semibold">
              Security Training
            </p>
          </motion.div>

          {/* Progress bar + rotating messages */}
          <motion.div
            className="w-56 space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.05 }}
          >
            {/* Track */}
            <div className="relative h-[2px] w-full rounded-full bg-black/[0.07] overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brand to-emerald-400"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: MIN_MS / 1000, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>

            {/* Message — aria-live so screen readers hear status changes */}
            <div
              className="h-4 flex items-center justify-center"
              aria-live="polite"
              aria-atomic="true"
            >
              <AnimatePresence mode="wait">
                <motion.p
                  key={msgIdx}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.16 }}
                  className="text-[11px] text-muted-foreground font-medium tracking-wide text-center"
                >
                  {MESSAGES[msgIdx]}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
