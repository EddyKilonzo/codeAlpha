"use client"

import { useState, useEffect, useRef } from 'react'

export function useCountUp(target: number, duration = 1000, enabled = true, decimals = 0): number {
  const [count, setCount] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const factor = Math.pow(10, decimals)
    const round = (n: number) => Math.round(n * factor) / factor
    if (!enabled) { setCount(round(target)); return }
    const start = Date.now()
    const from = 0

    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(round(from + (target - from) * eased))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration, enabled, decimals])

  return count
}
