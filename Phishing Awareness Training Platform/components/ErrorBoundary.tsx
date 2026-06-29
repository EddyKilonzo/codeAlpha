"use client"

import { Component, type ReactNode, type ErrorInfo } from 'react'
import { ShieldAlert, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  errorId: string | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, errorId: null }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true, errorId: crypto.randomUUID().slice(0, 8).toUpperCase() }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[ErrorBoundary]', error, info.componentStack)
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, errorId: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div
          role="alert"
          className="flex min-h-[320px] flex-col items-center justify-center gap-5 rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-12 text-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
            <ShieldAlert className="h-7 w-7 text-destructive" aria-hidden="true" />
          </div>
          <div className="space-y-1.5 max-w-xs">
            <p className="text-sm font-bold text-foreground">Something went wrong</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This section encountered an unexpected error. Your progress has been saved.
            </p>
            {this.state.errorId && (
              <p className="text-[10px] font-mono text-muted-foreground/60 mt-2">
                Ref: {this.state.errorId}
              </p>
            )}
          </div>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 rounded-xl bg-brand/10 border border-brand/20 px-4 py-2.5 text-xs font-semibold text-brand hover:bg-brand/15 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
