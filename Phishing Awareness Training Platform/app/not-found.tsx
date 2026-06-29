import Link from 'next/link'
import { ShieldCheck, ArrowLeft, Home } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Not Found',
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center gap-8 text-center max-w-md">
        {/* Icon */}
        <div className="relative">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-border bg-card shadow-lg">
            <svg
              className="absolute inset-0 w-full h-full rounded-3xl opacity-10"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <pattern id="nf-grid" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
                <path d="M 12 0 L 0 0 L 0 12" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#nf-grid)" />
            </svg>
            <ShieldCheck className="h-12 w-12 text-brand/40" aria-hidden="true" />
          </div>
          <div className="absolute -top-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full bg-background border border-border shadow-sm">
            <span className="text-lg font-black text-muted-foreground/60" aria-hidden="true">?</span>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand">404 — Not Found</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Page not found
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
            The page you&rsquo;re looking for doesn&rsquo;t exist or may have been moved.
            Head back to continue your training.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 rounded-xl border border-brand text-brand px-5 py-3 text-sm font-bold hover:bg-brand/[0.07] transition-colors flex-1"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Dashboard
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors flex-1"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}
