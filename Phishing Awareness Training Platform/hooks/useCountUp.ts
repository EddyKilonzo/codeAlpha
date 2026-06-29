"use client"

import { useState, useEffect, useRef } from 'react'

export function useCountUp(target: number, duration = 1000, enabled = true): number {
  const [count, setCount] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!enabled) { setCount(target); return }
    const start = Date.now()
    const from = 0

    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(from + (target - from) * eased))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration, enabled])

  return count
}
