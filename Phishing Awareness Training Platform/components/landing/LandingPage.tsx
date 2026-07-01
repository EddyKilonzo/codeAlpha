"use client"

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import {
  ShieldCheck, Lock, Eye, AlertTriangle, Key, Globe, Scan, Fingerprint,
  Award, BookOpen, Trophy, ArrowRight, ChevronDown,
  ShieldAlert, Fish, Crosshair, FileSearch, Mail, Brain, Clock, Star, Zap,
} from 'lucide-react'
import dynamic from 'next/dynamic'
const CertificateTemplate = dynamic(
  () => import('@/components/certificate/CertificateTemplate').then(m => ({ default: m.CertificateTemplate })),
  { ssr: false }
)
import { cn } from '@/lib/utils'

// ─── Floating icon positions — parallax only, no bounce ──────────────────────
const FLOATING_ICONS = [
  { id: 1, Icon: ShieldCheck,   pos: { top: '11%',   left: '6%'   }, depth: 0.55, delay: 0    },
  { id: 2, Icon: Lock,          pos: { top: '18%',   right: '8%'  }, depth: 0.85, delay: 0.4  },
  { id: 3, Icon: Eye,           pos: { top: '52%',   left: '4%'   }, depth: 0.35, delay: 1.1  },
  { id: 4, Icon: Key,           pos: { bottom: '26%',left: '9%'   }, depth: 0.7,  delay: 0.75 },
  { id: 5, Icon: Globe,         pos: { bottom: '22%',right: '7%'  }, depth: 0.45, delay: 1.4  },
  { id: 6, Icon: AlertTriangle, pos: { top: '8%',    right: '22%' }, depth: 0.95, delay: 0.2  },
  { id: 7, Icon: Scan,          pos: { bottom: '34%',right: '12%' }, depth: 0.65, delay: 0.9  },
  { id: 8, Icon: Fingerprint,   pos: { top: '66%',   right: '5%'  }, depth: 0.5,  delay: 0.55 },
]

const FEATURES = [
  {
    Icon: Mail,
    title: 'Realistic Simulations',
    description: 'Practise spotting fake emails, text messages, and login pages built to mirror real scams — so you know exactly what to look for.',
  },
  {
    Icon: BookOpen,
    title: 'Interactive Flashcards',
    description: 'Review key ideas with flip-card exercises for every module. Mark cards as learned or save them for later at your own pace.',
  },
  {
    Icon: Trophy,
    title: 'Earn Points & Badges',
    description: 'Collect XP, level up through 10 ranks, unlock achievements, and maintain daily streaks to stay motivated.',
  },
  {
    Icon: Award,
    title: 'Certificate of Completion',
    description: 'Finish all 6 modules and receive a professionally designed certificate — ready to save, print, or share.',
  },
]

const MODULES_PREVIEW = [
  { id: 'introduction',           title: 'Introduction to Phishing', Icon: ShieldAlert, mins: 8,  xp: 150 },
  { id: 'types-of-phishing',      title: 'Types of Phishing',        Icon: Fish,        mins: 12, xp: 175 },
  { id: 'attacker-operations',    title: 'How Attackers Operate',    Icon: Crosshair,   mins: 10, xp: 200 },
  { id: 'advanced-threats',       title: 'Advanced Threats',         Icon: Zap,         mins: 11, xp: 225 },
  { id: 'case-studies',           title: 'Real Case Studies',        Icon: FileSearch,  mins: 20, xp: 250 },
  { id: 'defense-best-practices', title: 'How to Stay Safe',         Icon: ShieldCheck, mins: 15, xp: 300 },
]

// ─── Floating icon — parallax only ────────────────────────────────────────────
function FloatingIcon({
  Icon, pos, depth, delay, smoothX, smoothY,
}: {
  Icon: React.ElementType
  pos: React.CSSProperties
  depth: number
  delay: number
  smoothX: ReturnType<typeof useSpring>
  smoothY: ReturnType<typeof useSpring>
}) {
  const x = useTransform(smoothX, (v: number) => v * depth * 42)
  const y = useTransform(smoothY, (v: number) => v * depth * 42)

  return (
    <motion.div
      className="absolute hidden lg:flex"
      style={{ ...pos, x, y }}
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: delay + 0.7, duration: 0.6, type: 'spring', stiffness: 180, damping: 16 }}
    >
      <div
        className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-white border border-black/[0.08]"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.05)' }}
      >
        <Icon style={{ width: 19, height: 19, color: 'rgba(0,0,0,0.35)' }} />
      </div>
    </motion.div>
  )
}

// ─── Navigation ───────────────────────────────────────────────────────────────
function LandingNav() {
  const ref = useRef<HTMLElement>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const fn = () => {
      const el = ref.current
      if (!el) return
      if (window.scrollY > 24) {
        el.style.setProperty('--nav-bg', 'rgba(255,255,255,0.92)')
        el.style.setProperty('--nav-border', 'rgba(0,0,0,0.1)')
        el.style.setProperty('--nav-shadow', '0 2px 20px rgba(0,0,0,0.08)')
      } else {
        el.style.setProperty('--nav-bg', 'rgba(255,255,255,0.75)')
        el.style.setProperty('--nav-border', 'rgba(0,0,0,0.07)')
        el.style.setProperty('--nav-shadow', 'none')
      }
    }
    window.addEventListener('scroll', fn, { passive: true })
    fn()
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      {/* ── Mobile header bar (visible on < sm) ───────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sm:hidden fixed top-0 inset-x-0 z-50 flex h-14 items-center justify-between px-4 border-b border-black/[0.07]"
        style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)' }}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden bg-white border border-black/[0.08]">
            <Image src="/logo.png" alt="PhishShield" width={32} height={32} className="object-contain" priority />
          </div>
          <span className="text-[15px] font-extrabold text-foreground tracking-tight">PhishShield</span>
        </Link>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-black/[0.05] transition-colors active:scale-95"
        >
          {mobileOpen
            ? <ChevronDown className="h-5 w-5 text-foreground rotate-180 transition-transform" />
            : <ChevronDown className="h-5 w-5 text-foreground transition-transform" />
          }
        </button>
      </motion.header>

      {/* ── Mobile dropdown menu ───────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="sm:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="sm:hidden fixed top-14 inset-x-0 z-50 bg-white border-b border-black/[0.07] shadow-lg px-4 py-4 space-y-2"
            >
              {[['#features', 'Features'], ['#modules', 'Modules']].map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center h-12 px-4 rounded-xl text-[15px] font-medium text-foreground hover:bg-black/[0.04] transition-colors"
                >
                  {label}
                </a>
              ))}
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 h-12 rounded-xl border border-brand text-brand font-bold text-[15px] hover:bg-brand/[0.07] transition-colors"
              >
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Desktop pill nav (hidden on mobile) ───────────────────────── */}
      <motion.nav
        ref={ref as React.RefObject<HTMLElement>}
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="hidden sm:block fixed top-5 left-1/3 z-50 -translate-x-1/2"
      >
        <div
          className="grid grid-cols-3 items-center gap-4 rounded-full px-5 py-2.5 transition-all duration-300 border w-[540px]"
          style={{
            background: 'var(--nav-bg, rgba(255,255,255,0.75))',
            borderColor: 'var(--nav-border, rgba(0,0,0,0.07))',
            backdropFilter: 'blur(20px)',
            boxShadow: 'var(--nav-shadow, none)',
          }}
        >
          <div className="flex justify-start">
            <Link href="/" className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden bg-white border border-black/[0.08] hover:opacity-80 transition-opacity">
              <Image src="/logo.png" alt="PhishShield home" width={32} height={32} className="object-contain" priority />
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6">
            {[['#features', 'Features'], ['#modules', 'Modules']].map(([href, label]) => (
              <a key={href} href={href} className="text-[13px] text-muted-foreground hover:text-foreground transition-colors duration-150 font-medium whitespace-nowrap">
                {label}
              </a>
            ))}
          </div>
          <div className="flex justify-end">
            <Link href="/dashboard" className="flex items-center gap-1.5 rounded-full border border-brand text-brand px-4 py-[7px] text-[13px] font-bold hover:bg-brand/[0.07] transition-all duration-150 whitespace-nowrap">
              Get Started <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </motion.nav>
    </>
  )
}

// ─── Features section ─────────────────────────────────────────────────────────
function FeaturesSection() {
  return (
    <section id="features" className="relative bg-[#f5f7fa] py-20 sm:py-28 px-4 border-y border-black/[0.06] hex-bg">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand mb-4">What You Get</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight leading-[1.08]">
            Everything you need to<br />
            <span className="text-muted-foreground/40">stay safe online.</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4">
          {FEATURES.map(({ Icon, title, description }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.09, duration: 0.5 }}
              className="group relative overflow-hidden rounded-2xl border border-black/[0.07] bg-white p-6 transition-all duration-300 hover:border-brand/30 shadow-premium"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/[0.08] border border-brand/20 mb-5">
                <Icon className="h-5 w-5 text-brand" />
              </div>
              <h3 className="text-[15px] font-bold text-foreground mb-2">{title}</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Modules section ──────────────────────────────────────────────────────────
function ModulesSection() {
  return (
    <section id="modules" className="relative bg-white py-20 sm:py-28 px-4 hex-bg">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand mb-4">The Course</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight leading-[1.08]">
            6 modules. Start to finish.
          </h2>
          <p className="mt-4 text-muted-foreground text-[15px] max-w-md mx-auto leading-relaxed">
            Progress from the basics to hands-on defence skills at your own pace.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MODULES_PREVIEW.map(({ id, title, Icon, mins, xp }, i) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ delay: i * 0.07, duration: 0.45 }}
              className="group flex items-center gap-4 rounded-2xl border border-black/[0.07] bg-white p-4 transition-all duration-200 hover:border-brand/25 shadow-premium-sm"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/[0.08] border border-brand/20">
                <Icon className="h-5 w-5 text-brand" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold text-foreground truncate">{title}</p>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{mins} min</span>
                  <span className="flex items-center gap-1 text-brand font-semibold"><Star className="h-3 w-3" />+{xp} XP</span>
                </div>
              </div>
              <div className="text-[11px] font-bold text-black/10 group-hover:text-brand/40 transition-colors tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center mt-12"
        >
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 rounded-xl border border-brand/40 bg-brand/[0.06] px-7 py-3 text-[14px] font-semibold text-brand hover:bg-brand/[0.1] hover:border-brand/60 transition-all duration-200"
          >
            Begin the Course
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Certificate section ──────────────────────────────────────────────────────
const SAMPLE_CERT_DATA = {
  userName: 'Alex Johnson',
  completionDate: 'June 30, 2026',
  averageScore: 94,
  certificateId: 'PS-2026-EXAMPLE',
  totalModules: 6,
}

function CertificateSection() {
  const [scale, setScale] = useState(0.72)

  useEffect(() => {
    const update = () => {
      // available width = viewport minus section px-4 padding (32px), capped at max-w-5xl (1024px)
      const available = Math.min(window.innerWidth - 32, 1024 - 32)
      setScale(Math.min(available / 900, 0.72))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const scaledWidth = Math.round(900 * scale)
  const scaledHeight = Math.round(640 * scale)

  return (
    <section id="certificate" className="relative py-20 sm:py-28 px-4 bg-[#f5f7fa] border-t border-black/[0.06] overflow-hidden hex-bg">
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[radial-gradient(ellipse,rgba(22,163,74,0.07)_0%,transparent_65%)]" />

      <div className="relative mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand mb-4">Your Achievement</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight leading-[1.08]">
            Finish the course,<br />
            <span className="text-muted-foreground/40">earn your certificate.</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-[15px] max-w-md mx-auto leading-relaxed">
            Complete all 6 modules and pass all assessments to receive a professionally designed PDF certificate — downloadable, printable, and shareable.
          </p>
        </motion.div>

        {/* Real certificate preview — same component used to generate the PDF */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto"
          style={{ width: `${scaledWidth}px` }}
        >
          {/* EXAMPLE badge */}
          <div className="absolute -top-3 right-2 z-10 flex items-center gap-1.5 bg-brand text-white text-[10px] font-extrabold tracking-widest uppercase px-3.5 py-1.5 rounded-full shadow-md select-none pointer-events-none">
            <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
            Example
          </div>

          {/* Outer shadow + border wrapper — exact scaled size, no empty space */}
          <div
            className="overflow-hidden rounded-xl"
            style={{
              width: `${scaledWidth}px`,
              height: `${scaledHeight}px`,
              boxShadow: '0 24px 80px rgba(0,0,0,0.14), 0 4px 16px rgba(0,0,0,0.08)',
              border: '1px solid rgba(22,163,74,0.18)',
            }}
          >
            <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: '900px', height: '640px' }}>
              <CertificateTemplate data={SAMPLE_CERT_DATA} />
            </div>
          </div>
        </motion.div>

        {/* CTA row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center mt-12"
        >
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 rounded-xl border border-brand/40 bg-brand/[0.06] px-7 py-3 text-[14px] font-semibold text-brand hover:bg-brand/[0.1] hover:border-brand/60 transition-all duration-200"
          >
            Start Earning Yours
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <p className="mt-3 text-[12px] text-muted-foreground/50">Free · No account required · Instant PDF download</p>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Main LandingPage ─────────────────────────────────────────────────────────
export function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const smoothX = useSpring(mouseX, { stiffness: 22, damping: 11 })
  const smoothY = useSpring(mouseY, { stiffness: 22, damping: 11 })

  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return
    const fn = (e: MouseEvent) => {
      const r = hero.getBoundingClientRect()
      mouseX.set((e.clientX - r.left - r.width / 2) / r.width)
      mouseY.set((e.clientY - r.top - r.height / 2) / r.height)
    }
    hero.addEventListener('mousemove', fn, { passive: true })
    return () => hero.removeEventListener('mousemove', fn)
  }, [mouseX, mouseY])

  return (
    <div className="min-h-screen bg-white text-foreground overflow-x-hidden hex-bg">
      <LandingNav />

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20 sm:pt-36 pb-16 sm:pb-28 px-4 bg-white hex-bg"
      >
        {/* Background layers */}
        <div className="pointer-events-none select-none absolute inset-0">
          {/* Layered brand glow — two overlapping radials for depth */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[1100px] h-[700px] bg-[radial-gradient(ellipse,rgba(22,163,74,0.13)_0%,transparent_62%)]" />
          <div className="absolute top-1/3 left-1/3 w-[600px] h-[500px] bg-[radial-gradient(ellipse,rgba(22,163,74,0.06)_0%,transparent_70%)] blur-3xl" />
          {/* Edge vignette — draws the eye to center */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(245,247,250,0.5)_100%)]" />
          {/* Fade bottom into next section */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
        </div>

        {/* Floating icons — light mode style */}
        {FLOATING_ICONS.map(p => (
          <FloatingIcon key={p.id} {...p} smoothX={smoothX} smoothY={smoothY} />
        ))}

        {/* Hero content */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-[860px]">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-brand/25 bg-brand/[0.06] px-4 py-2"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brand" style={{ boxShadow: '0 0 6px rgba(22,163,74,0.6)' }} />
            <span className="text-[11px] font-extrabold text-brand uppercase tracking-[0.2em]">
              Security Awareness Training
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-6xl lg:text-[78px] xl:text-[88px] font-black tracking-[-0.025em] leading-[1.03] text-foreground mb-7"
          >
            Learn to Spot It.
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #15803d 0%, #16a34a 45%, #22c55e 100%)' }}
            >
              Stop the Attack.
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="text-[17px] sm:text-[18px] text-muted-foreground max-w-[540px] leading-[1.7] mb-11"
          >
            A short, practical course for everyone at your organisation.
            Learn how to recognise scams, fake emails, and online tricks —
            no technical background needed.
          </motion.p>

          {/* CTAs — no solid fills */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 justify-center mb-12 sm:mb-20 w-full max-w-sm sm:max-w-none"
          >
            <Link
              href="/dashboard"
              className="group inline-flex items-center justify-center gap-2.5 rounded-xl border-2 border-brand text-brand px-8 py-4 text-[15px] font-extrabold transition-all duration-200 hover:bg-brand/[0.07] hover:-translate-y-0.5"
            >
              Start Free Training
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#modules"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-[15px] font-semibold text-muted-foreground border border-black/[0.1] hover:text-foreground hover:border-black/20 hover:bg-black/[0.02] transition-all duration-200"
            >
              See the Course
            </a>
          </motion.div>

          {/* Stat cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-[560px]"
          >
            {[
              { Icon: BookOpen, value: '6',    sub: 'Short Modules'  },
              { Icon: Brain,    value: '100+', sub: 'Practice Questions' },
              { Icon: Award,    value: 'PDF',  sub: 'Certificate'    },
            ].map(({ Icon, value, sub }, i) => (
              <motion.div
                key={sub}
                initial={{ opacity: 0, y: 14, scale: 0.93 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.09, duration: 0.5, type: 'spring', stiffness: 200, damping: 18 }}
                className="flex items-center gap-4 rounded-2xl p-5 text-left bg-white border border-black/[0.07] shadow-premium"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/[0.08] border border-brand/20">
                  <Icon className="h-5 w-5 text-brand" />
                </div>
                <div>
                  <p className="text-[22px] font-black text-foreground leading-none">{value}</p>
                  <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{sub}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none"
        >
          <ChevronDown className="h-5 w-5 text-black/20" />
        </motion.div>
      </section>

      <FeaturesSection />
      <ModulesSection />
      <CertificateSection />

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-black/[0.06] py-16 px-4 bg-[#f5f7fa]">
        <div className="mx-auto max-w-5xl">
          {/* Footer CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-6 rounded-2xl border border-brand/20 bg-white px-7 py-6 mb-12 shadow-premium"
          >
            <div className="text-center sm:text-left">
              <p className="text-[15px] font-bold text-foreground">Ready to get started?</p>
              <p className="text-[13px] text-muted-foreground mt-0.5">Free training — no account needed. Begin right now.</p>
            </div>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-xl border border-brand text-brand px-6 py-3 text-[14px] font-bold hover:bg-brand/[0.07] transition-colors shrink-0"
            >
              Start Training <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          {/* Brand */}
          <div className="flex items-center justify-center gap-2.5 mb-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-md overflow-hidden bg-white border border-black/[0.08]">
              <Image src="/logo.png" alt="PhishShield" width={24} height={24} className="object-contain" />
            </div>
            <span className="text-[14px] font-extrabold text-foreground/40 tracking-tight">PhishShield</span>
          </div>
          <p className={cn('text-center text-[12px] text-muted-foreground/60')}>
            © {new Date().getFullYear()} PhishShield — Security Awareness Training Platform
          </p>
        </div>
      </footer>
    </div>
  )
}
