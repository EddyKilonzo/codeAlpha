"use client"

import { useRef, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { X, Download, Printer, User, ShieldCheck, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { sanitizeName, sanitizeFilename } from '@/lib/sanitize'
import { useProgress } from '@/hooks/useProgress'
import { CertificateTemplate, drawHexGrid, drawWaveStrip, type CertificateData } from './CertificateTemplate'

// ── Confetti celebration ───────────────────────────────────────────────────
const CONFETTI_COLORS = ['#16a34a', '#4ade80', '#86efac', '#22c55e', '#bbf7d0', '#15803d']

function CertConfetti() {
  const pieces = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    left: `${5 + (i / 36) * 90}%`,
    delay: Math.random() * 0.5,
    duration: 1.4 + Math.random() * 0.9,
    size: 5 + Math.random() * 5,
    rotate: Math.random() * 720 - 360,
    wobble: Math.random() > 0.5 ? 18 : -18,
  }))

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-full overflow-hidden rounded-2xl z-10">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className="absolute top-0 rounded-[1px]"
          style={{
            left: p.left,
            width: p.size,
            height: p.size * 2,
            background: p.color,
          }}
          initial={{ y: -20, opacity: 1, rotate: 0, x: 0 }}
          animate={{
            y: 520,
            opacity: [1, 1, 1, 0],
            rotate: p.rotate,
            x: [0, p.wobble, -p.wobble, p.wobble * 0.5, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'easeIn',
            x: { duration: p.duration, ease: 'easeInOut', times: [0, 0.25, 0.5, 0.75, 1] },
          }}
        />
      ))}
    </div>
  )
}

const PDF_MESSAGES = [
  'Preparing your certificate...',
  'Verifying completion...',
  'Generating secure PDF...',
  'Finalizing your achievement...',
]

function PdfMessages() {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % PDF_MESSAGES.length), 900)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="h-5 flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.p
          key={idx}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className="text-[12px] font-semibold text-brand tracking-wide"
        >
          {PDF_MESSAGES[idx]}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}

interface Props {
  open: boolean
  onClose: () => void
}

interface NameForm { fullName: string }

// Allowed characters pattern for the name input
const NAME_PATTERN = /^[a-zA-ZÀ-ÖØ-öø-ÿ\s'\-.]+$/

export function CertificateModal({ open, onClose }: Props) {
  const { progress, setUserName, setCertificateId } = useProgress()
  const [step, setStep] = useState<'name' | 'certificate'>(
    progress.userName ? 'certificate' : 'name'
  )
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(!progress.userName)
  const certRef = useRef<HTMLDivElement>(null)

  // Show confetti once when certificate step is first revealed
  useEffect(() => {
    if (step === 'certificate' && showConfetti) {
      const id = setTimeout(() => setShowConfetti(false), 2500)
      return () => clearTimeout(id)
    }
  }, [step, showConfetti])

  const { register, handleSubmit, formState: { errors } } = useForm<NameForm>({
    defaultValues: { fullName: progress.userName ?? '' },
  })

  const getAverageScore = useCallback(() => {
    const scores = Object.values(progress.quizScores).filter((s) => s.passed)
    if (scores.length === 0) return 100
    return Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length)
  }, [progress.quizScores])

  const getCertId = useCallback((): string => {
    if (progress.certificateId) return progress.certificateId
    const id = `PHG-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
    setCertificateId(id)
    return id
  }, [progress.certificateId, setCertificateId])

  const certData: CertificateData = {
    userName: progress.userName ?? 'Graduate',
    completionDate: new Date().toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    }),
    averageScore: getAverageScore(),
    certificateId: getCertId(),
    totalModules: 6,
  }

  const onNameSubmit = (data: NameForm) => {
    const { value, error } = sanitizeName(data.fullName)
    if (error) return
    setUserName(value)
    setShowConfetti(true)
    setStep('certificate')
  }

  const handleDownload = async () => {
    if (!certRef.current || isDownloading) return
    setIsDownloading(true)
    setDownloadError(null)

    // Place a full-size clone outside any overflow/scroll container so html2canvas
    // captures all 900×640px without clipping.
    const wrapper = document.createElement('div')
    wrapper.style.cssText = 'position:fixed;top:0;left:-9999px;width:900px;height:640px;z-index:-1;pointer-events:none;'
    const clone = certRef.current.cloneNode(true) as HTMLElement
    wrapper.appendChild(clone)

    // Grab live canvas references BEFORE html2canvas runs (used inside onclone).
    const srcCanvases = Array.from(
      certRef.current.querySelectorAll<HTMLCanvasElement>('[data-cert-pattern]')
    )

    document.body.appendChild(wrapper)

    try {
      const [html2canvas, { jsPDF }] = await Promise.all([
        import('html2canvas').then((m) => m.default),
        import('jspdf'),
      ])
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#fcfaf7',
        logging: false,
        width: 900,
        height: 640,
        onclone: (clonedDoc, clonedEl) => {
          // Mark the certificate root so the style below can exclude it.
          clonedEl.setAttribute('data-cert-root', 'true')

          // html2canvas renders SVG data-URL backgrounds by loading the SVG into a
          // canvas. If the SVG has no explicit width/height, that canvas is 0×0 and
          // ctx.createPattern throws InvalidStateError.
          //
          // The pre-clone getComputedStyle approach is unreliable because html2canvas
          // builds its own CSS cascade from the cloned document's stylesheets. The
          // only safe place to fix this is inside onclone, where we work on the exact
          // document html2canvas will render.
          //
          // Strategy: inject a high-specificity stylesheet rule that suppresses
          // background-image on every element OUTSIDE the certificate. Elements
          // inside the certificate use canvas elements and radial-gradient inline
          // styles — neither triggers the SVG canvas-pattern error.
          const fix = clonedDoc.createElement('style')
          fix.textContent = `
            *:not([data-cert-root]):not([data-cert-root] *) {
              background-image: none !important;
            }
          `
          clonedDoc.head.appendChild(fix)

          // html2canvas reclones elements internally so canvas pixels are lost.
          // Redraw hex grid + wave borders from the live source canvases.
          clonedEl.querySelectorAll<HTMLCanvasElement>('[data-cert-pattern]').forEach((dst, i) => {
            const src = srcCanvases[i]
            const pattern = dst.getAttribute('data-cert-pattern')
            if (src) {
              const ctx = dst.getContext('2d')
              if (ctx) ctx.drawImage(src, 0, 0)
            } else if (pattern === 'hex') {
              drawHexGrid(dst)
            } else if (pattern === 'wave') {
              drawWaveStrip(dst)
            }
          })
        },
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const w = pdf.internal.pageSize.getWidth()
      const h = pdf.internal.pageSize.getHeight()
      pdf.addImage(imgData, 'PNG', 0, 0, w, h)
      const safeName = sanitizeFilename(certData.userName)
      pdf.save(`PhishShield-Certificate-${safeName}.pdf`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('Certificate download failed:', err)
      setDownloadError(`PDF failed: ${msg}`)
    } finally {
      document.body.removeChild(wrapper)
      setIsDownloading(false)
    }
  }

  const handlePrint = () => {
    const el = certRef.current
    if (!el) return

    // Use a Blob URL instead of document.write to avoid any injection surface
    // and to keep the print window properly sandboxed.
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-Content-Type-Options" content="nosniff">
  <title>PhishShield Certificate</title>
  <style>
    *,*::before,*::after{box-sizing:border-box}
    body{margin:0;padding:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    @media print{body{margin:0}}
  </style>
</head>
<body>${el.outerHTML}</body>
</html>`

    const blob = new Blob([html], { type: 'text/html; charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const win = window.open(url, '_blank', 'noopener,noreferrer')
    if (win) {
      win.addEventListener('load', () => {
        win.print()
        URL.revokeObjectURL(url)
      })
    } else {
      URL.revokeObjectURL(url)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Certificate of Completion"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="relative w-full max-w-[980px] rounded-2xl border border-border bg-background shadow-2xl overflow-hidden"
          >
            {/* Confetti — fires once when certificate is revealed */}
            <AnimatePresence>
              {step === 'certificate' && showConfetti && <CertConfetti />}
            </AnimatePresence>

            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10">
                  <ShieldCheck className="h-4 w-4 text-brand" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Certificate of Completion</p>
                  <p className="text-[10px] text-muted-foreground">PhishShield Cyber Security Training</p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close certificate modal"
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Name step */}
            <AnimatePresence mode="wait">
              {step === 'name' && (
                <motion.div
                  key="name-step"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-8 space-y-6"
                >
                  <div className="text-center space-y-2">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: 'spring', stiffness: 500 }}
                      className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand/10"
                    >
                      <ShieldCheck className="h-8 w-8 text-brand" />
                    </motion.div>
                    <h2 className="text-xl font-bold text-foreground">Course Complete!</h2>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Enter your full name as it should appear on your certificate.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit(onNameSubmit)} className="max-w-sm mx-auto space-y-4" noValidate>
                    <div className="space-y-1.5">
                      <label htmlFor="cert-name" className="text-xs font-semibold text-foreground uppercase tracking-wider">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <input
                          id="cert-name"
                          {...register('fullName', {
                            required: 'Name is required',
                            minLength: { value: 2, message: 'At least 2 characters required' },
                            maxLength: { value: 100, message: 'Name must be 100 characters or fewer' },
                            pattern: {
                              value: NAME_PATTERN,
                              message: 'Name may only contain letters, spaces, hyphens, apostrophes, and periods',
                            },
                            validate: (v) => {
                              const { error } = sanitizeName(v)
                              return error ?? true
                            },
                          })}
                          className={cn(
                            'w-full rounded-xl border bg-background pl-10 pr-4 py-3 text-sm outline-none transition-all',
                            'focus:border-brand focus:ring-2 focus:ring-brand/20',
                            errors.fullName ? 'border-red-400' : 'border-border'
                          )}
                          placeholder="e.g. Jane Smith"
                          autoComplete="name"
                          autoFocus
                          aria-describedby={errors.fullName ? 'cert-name-error' : undefined}
                          aria-invalid={!!errors.fullName}
                        />
                      </div>
                      <AnimatePresence>
                        {errors.fullName && (
                          <motion.p
                            key="cert-error"
                            id="cert-name-error"
                            role="alert"
                            initial={{ opacity: 0, y: -6, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -6, height: 0 }}
                            transition={{ duration: 0.18 }}
                            className="text-xs text-red-500 overflow-hidden"
                          >
                            {errors.fullName.message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full rounded-xl border border-brand text-brand py-3 text-sm font-bold hover:bg-brand/[0.07] transition-colors"
                    >
                      Generate Certificate
                    </motion.button>
                  </form>
                </motion.div>
              )}

              {/* Certificate step */}
              {step === 'certificate' && (
                <motion.div
                  key="cert-step"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 space-y-5"
                >
                  {/* Certificate preview + download overlay */}
                  <div className="relative">
                    <motion.div
                      initial={{ scale: 0, opacity: 0, rotate: -8 }}
                      animate={{ scale: [0, 1.06, 0.97, 1], opacity: [0, 1, 1, 1], rotate: [-8, 2, -1, 0] }}
                      transition={{ duration: 0.55, times: [0, 0.48, 0.72, 1], ease: 'easeOut', delay: 0.08 }}
                      className="overflow-x-auto rounded-xl border border-brand/30 shadow-lg"
                      style={{
                        boxShadow: '0 0 0 1px rgba(22,163,74,0.15), 0 4px 32px rgba(22,163,74,0.12)',
                      }}
                    >
                      <div className="min-w-[900px]">
                        <CertificateTemplate ref={certRef} data={certData} />
                      </div>
                    </motion.div>

                    {/* Premium PDF generation overlay */}
                    <AnimatePresence>
                      {isDownloading && (
                        <motion.div
                          initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                          animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="absolute inset-0 rounded-xl flex flex-col items-center justify-center gap-5"
                          style={{ background: 'rgba(255,255,255,0.88)' }}
                        >
                          {/* Animated seal */}
                          <div className="relative">
                            <motion.div
                              className="absolute inset-0 m-[-16px] rounded-full bg-brand/10"
                              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                              style={{ filter: 'blur(14px)' }}
                            />
                            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
                              <motion.path
                                d="M32 6 L54 14 L54 30 Q54 48 32 58 Q10 48 10 30 L10 14 Z"
                                stroke="#16a34a" strokeWidth="2" strokeLinecap="round" fill="rgba(22,163,74,0.07)"
                                animate={{ scale: [1, 1.04, 1] }}
                                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                              />
                              <motion.path
                                d="M22 32 L29 39 L43 24"
                                stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: [0, 1, 1, 0] }}
                                transition={{ duration: 2, repeat: Infinity, times: [0, 0.4, 0.7, 1], ease: 'easeInOut' }}
                              />
                            </svg>
                          </div>

                          {/* Rotating messages */}
                          <PdfMessages />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Error message */}
                  <AnimatePresence>
                    {downloadError && (
                      <motion.p
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="text-xs text-red-500 text-center"
                      >
                        {downloadError}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Actions — fade in after certificate appears */}
                  <motion.div
                    className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55, duration: 0.3 }}
                  >
                    <button
                      onClick={() => setStep('name')}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors text-center sm:text-left"
                    >
                      Edit name
                    </button>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <motion.button
                        onClick={handlePrint}
                        disabled={isDownloading}
                        whileHover={{ scale: isDownloading ? 1 : 1.02 }}
                        whileTap={{ scale: isDownloading ? 1 : 0.97 }}
                        className="flex items-center justify-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors min-h-[48px] disabled:opacity-40"
                      >
                        <Printer className="h-4 w-4" aria-hidden="true" />
                        Print
                      </motion.button>
                      <motion.button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        whileHover={{ scale: isDownloading ? 1 : 1.02 }}
                        whileTap={{ scale: isDownloading ? 1 : 0.97 }}
                        className="flex items-center justify-center gap-2 rounded-xl border border-brand text-brand px-5 py-3 text-sm font-bold hover:bg-brand/[0.07] transition-colors disabled:opacity-60 min-h-[48px]"
                        aria-busy={isDownloading}
                      >
                        {isDownloading
                          ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                          : <Download className="h-4 w-4" aria-hidden="true" />}
                        {isDownloading ? 'Building PDF…' : 'Download PDF'}
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
