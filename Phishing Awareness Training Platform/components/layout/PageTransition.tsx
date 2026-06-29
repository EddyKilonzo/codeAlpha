"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

function RouteBar() {
  const pathname = usePathname()
  const [active, setActive] = useState(false)
  const [prev, setPrev] = useState(pathname)

  useEffect(() => {
    if (pathname !== prev) {
      setActive(true)
      const id = setTimeout(() => {
        setActive(false)
        setPrev(pathname)
      }, 500)
      return () => clearTimeout(id)
    }
  }, [pathname, prev])

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-[9998] h-[2px] bg-gradient-to-r from-brand to-emerald-400"
          initial={{ scaleX: 0, transformOrigin: '0% 50%' }}
          animate={{ scaleX: 0.92, transformOrigin: '0% 50%' }}
          exit={{ scaleX: 1, opacity: 0, transformOrigin: '0% 50%' }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        />
      )}
    </AnimatePresence>
  )
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <>
      <RouteBar />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2, ease: [0.25, 0, 0, 1] }}
          className="h-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  )
}
