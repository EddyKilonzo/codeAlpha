"use client"

import { useEffect } from 'react'
import Link from 'next/link'
import { ShieldAlert, RefreshCw, Home } from 'lucide-react'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[GlobalError]', error)
    }
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center gap-6 text-center max-w-sm">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-destructive/10 border border-destructive/20">
          <ShieldAlert className="h-10 w-10 text-destructive" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Something went wrong
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            An unexpected error occurred. Your progress data is safe in local storage.
          </p>
          {error.digest && (
            <p className="text-[10px] font-mono text-muted-foreground/50 mt-1">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 rounded-xl border border-brand text-brand px-5 py-3 text-sm font-bold hover:bg-brand/[0.07] transition-colors flex-1"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Try again
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors flex-1"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}
