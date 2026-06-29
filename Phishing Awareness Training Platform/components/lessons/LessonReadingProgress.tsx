"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export function LessonReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const main = document.getElementById('main-content')
    if (!main) return

    const handler = () => {
      const { scrollTop, scrollHeight, clientHeight } = main
      const scrollable = scrollHeight - clientHeight
      setProgress(scrollable > 0 ? Math.min((scrollTop / scrollable) * 100, 100) : 0)
    }

    main.addEventListener('scroll', handler, { passive: true })
    handler()
    return () => main.removeEventListener('scroll', handler)
  }, [])

  return (
    <div className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-brand via-brand-light to-emerald-400"
        style={{ transformOrigin: 'left' }}
        animate={{ scaleX: progress / 100 }}
        transition={{ duration: 0.08, ease: 'linear' }}
      />
    </div>
  )
}
