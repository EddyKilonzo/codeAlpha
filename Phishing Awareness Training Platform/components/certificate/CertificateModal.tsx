"use client"

import { useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { X, Download, Printer, User, ShieldCheck, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProgress } from '@/hooks/useProgress'
import { CertificateTemplate, type CertificateData } from './CertificateTemplate'

interface Props {
  open: boolean
  onClose: () => void
}

interface NameForm { fullName: string }

export function CertificateModal({ open, onClose }: Props) {
  const { progress, setUserName, setCertificateId } = useProgress()
  const [step, setStep] = useState<'name' | 'certificate'>(
    progress.userName ? 'certificate' : 'name'
  )
  const [isDownloading, setIsDownloading] = useState(false)
  const certRef = useRef<HTMLDivElement>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<NameForm>({
    defaultValues: { fullName: progress.userName ?? '' },
  })

  // Compute certificate data
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
    setUserName(data.fullName.trim())
    setStep('certificate')
  }

  const handleDownload = async () => {
    if (!certRef.current || isDownloading) return
    setIsDownloading(true)
    try {
      const [html2canvas, { jsPDF }] = await Promise.all([
        import('html2canvas').then((m) => m.default),
        import('jspdf'),
      ])
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const w = pdf.internal.pageSize.getWidth()
      const h = pdf.internal.pageSize.getHeight()
      pdf.addImage(imgData, 'PNG', 0, 0, w, h)
      pdf.save(`PhishGuard-Certificate-${certData.userName.replace(/\s+/g, '-')}.pdf`)
    } finally {
      setIsDownloading(false)
    }
  }

  const handlePrint = () => {
    const el = certRef.current
    if (!el) return
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html><head><title>PhishGuard Certificate</title>
      <style>
        body { margin: 0; padding: 0; }
        @media print { body { margin: 0; } }
      </style></head>
      <body>${el.outerHTML}</body></html>
    `)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 300)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
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
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10">
                  <ShieldCheck className="h-4 w-4 text-brand" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Certificate of Completion</p>
                  <p className="text-[10px] text-muted-foreground">PhishGuard Cyber Security Training</p>
                </div>
              </div>
              <button
                onClick={onClose}
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

                  <form onSubmit={handleSubmit(onNameSubmit)} className="max-w-sm mx-auto space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          {...register('fullName', {
                            required: 'Name is required',
                            minLength: { value: 2, message: 'At least 2 characters' },
                          })}
                          className={cn(
                            'w-full rounded-xl border bg-background pl-10 pr-4 py-3 text-sm outline-none transition-all',
                            'focus:border-brand focus:ring-2 focus:ring-brand/20',
                            errors.fullName ? 'border-red-400' : 'border-border'
                          )}
                          placeholder="e.g. Jane Smith"
                          autoFocus
                        />
                      </div>
                      {errors.fullName && (
                        <p className="text-xs text-red-500">{errors.fullName.message}</p>
                      )}
                    </div>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full rounded-xl bg-brand py-3 text-sm font-bold text-white hover:bg-brand/90 transition-colors"
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
                  {/* Certificate preview — scrollable on small screens */}
                  <motion.div
                    initial={{ scale: 0.88, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.1 }}
                    className="overflow-x-auto rounded-xl border border-border shadow-lg"
                  >
                    <div className="min-w-[900px]">
                      <CertificateTemplate ref={certRef} data={certData} />
                    </div>
                  </motion.div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-3">
                    <button
                      onClick={() => setStep('name')}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Edit name
                    </button>
                    <div className="flex items-center gap-3">
                      <motion.button
                        onClick={handlePrint}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.96 }}
                        className="flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                      >
                        <Printer className="h-4 w-4" />
                        Print
                      </motion.button>
                      <motion.button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        whileHover={{ scale: isDownloading ? 1 : 1.03 }}
                        whileTap={{ scale: isDownloading ? 1 : 0.96 }}
                        className="flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand/90 transition-colors disabled:opacity-60"
                      >
                        {isDownloading
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <Download className="h-4 w-4" />}
                        {isDownloading ? 'Generating PDF…' : 'Download PDF'}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
