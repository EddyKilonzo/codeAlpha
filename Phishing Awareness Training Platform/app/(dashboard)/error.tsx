"use client"

import { useEffect } from 'react'
import Link from 'next/link'
import { ShieldAlert, RefreshCw, Home } from 'lucide-react'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: Props) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[DashboardError]', error)
    }
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 border border-destructive/20">
        <ShieldAlert className="h-8 w-8 text-destructive" aria-hidden="true" />
      </div>

      <div className="space-y-2 max-w-sm">
        <h2 className="text-xl font-extrabold tracking-tight text-foreground">
          Something went wrong
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          An error occurred in this section. Your progress is safely stored.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={reset}
          className="flex items-center justify-center gap-2 rounded-xl border border-brand text-brand px-5 py-3 text-sm font-bold hover:bg-brand/[0.07] transition-colors"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Try again
        </button>
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
        >
          <Home className="h-4 w-4" aria-hidden="true" />
          Dashboard
        </Link>
      </div>
    </div>
  )
}
