"use client"

import { ThemeProvider } from 'next-themes'
import { MotionConfig } from 'framer-motion'
import { ProgressProvider } from './ProgressContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import type { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  )
}
