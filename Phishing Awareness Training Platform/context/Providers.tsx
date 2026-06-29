"use client"

import { ThemeProvider } from 'next-themes'
import { MotionConfig } from 'framer-motion'
import { ProgressProvider } from './ProgressContext'
import type { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <MotionConfig reducedMotion="user">
        <ProgressProvider>{children}</ProgressProvider>
      </MotionConfig>
    </ThemeProvider>
  )
}
