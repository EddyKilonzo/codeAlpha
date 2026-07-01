"use client"

import { useRef, useState } from 'react'
import { Download, Upload, CheckCircle2, AlertCircle } from 'lucide-react'
import { useProgress } from '@/hooks/useProgress'
import { cn } from '@/lib/utils'

export function ProgressBackup() {
  const { exportProgress, importProgress } = useProgress()
  const fileRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)

  const onExport = () => {
    const res = exportProgress()
    setStatus(res.ok
      ? { type: 'ok', msg: 'Backup downloaded.' }
      : { type: 'err', msg: res.error ?? 'Export failed.' })
  }

  const onPick = () => fileRef.current?.click()

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-importing the same file
    if (!file) return
    try {
      const text = await file.text()
      const res = importProgress(text) // reloads the page on success
      if (!res.ok) setStatus({ type: 'err', msg: res.error ?? 'Import failed.' })
    } catch {
      setStatus({ type: 'err', msg: 'Could not read that file.' })
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-premium-sm">
      <h3 className="text-sm font-bold text-foreground">Back up your progress</h3>
      <p className="mt-1 text-[13px] text-muted-foreground leading-relaxed">
        Your progress and certificate are stored only in this browser. Export a backup
        so clearing your cache — or switching devices — doesn’t wipe it.
      </p>

      <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
        <button
          type="button"
          onClick={onExport}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-brand text-brand px-5 text-[14px] font-bold transition-colors hover:bg-brand/[0.07] active:scale-[0.98]"
        >
          <Download className="h-4 w-4" /> Export backup
        </button>
        <button
          type="button"
          onClick={onPick}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border text-foreground px-5 text-[14px] font-bold transition-colors hover:bg-muted active:scale-[0.98]"
        >
          <Upload className="h-4 w-4" /> Restore from file
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          onChange={onFile}
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      {status && (
        <p
          role="status"
          className={cn(
            'mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium',
            status.type === 'ok' ? 'text-brand' : 'text-red-600 dark:text-red-400'
          )}
        >
          {status.type === 'ok'
            ? <CheckCircle2 className="h-4 w-4" />
            : <AlertCircle className="h-4 w-4" />}
          {status.msg}
        </p>
      )}
    </div>
  )
}
