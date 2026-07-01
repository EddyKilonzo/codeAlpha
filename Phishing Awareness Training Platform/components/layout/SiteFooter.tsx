"use client"

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Globe, Mail, ArrowRight } from 'lucide-react'

interface SiteFooterProps {
  /** Show the promotional "Ready to get started?" call-to-action card (landing/marketing only). */
  showCta?: boolean
}

export function SiteFooter({ showCta = false }: SiteFooterProps) {
  return (
    <footer className="relative border-t-2 border-brand/25 pt-16 px-4 bg-[#f5f7fa] shadow-[0_-1px_0_0_rgba(0,0,0,0.04)]">
      {/* Distinctive brand accent line separating footer from the page */}
      <div className="absolute -top-[2px] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand to-transparent" />
      <div className="mx-auto max-w-5xl">
        {/* Footer CTA */}
        {showCta && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-6 rounded-2xl border border-brand/20 bg-white px-7 py-6 mb-14 shadow-premium"
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
        )}

        {/* Main footer grid */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr]">
          {/* Brand + blurb */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden bg-white border border-black/[0.08]">
                <Image src="/logo.png" alt="PhishShield" width={28} height={28} className="object-contain" />
              </div>
              <span className="text-[16px] font-extrabold text-foreground tracking-tight">PhishShield</span>
            </div>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Practical, gamified phishing awareness training for everyone at your
              organisation — recognise scams, pass the assessments, earn your certificate.
            </p>
          </div>

          {/* Explore links */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-foreground/50 mb-4">Explore</p>
            <ul className="space-y-2.5">
              {[
                ['/#features', 'Features'],
                ['/#modules', 'Modules'],
                ['/dashboard', 'Start Training'],
                ['/achievements', 'Achievements'],
              ].map(([href, label]) => (
                <li key={label}>
                  <Link href={href} className="text-[13px] text-muted-foreground hover:text-brand transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect / author */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-foreground/50 mb-4">Connect</p>
            <div className="flex items-center gap-2.5">
              <a
                href="https://eddy-max.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Eddy Max — Portfolio"
                className="group flex h-9 w-9 items-center justify-center rounded-lg border border-black/[0.08] bg-white text-muted-foreground hover:border-brand/40 hover:text-brand transition-colors"
              >
                <Globe className="h-[18px] w-[18px]" />
              </a>
              <a
                href="https://www.linkedin.com/in/eddy-kilonzo-/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Eddy Kilonzo — LinkedIn"
                className="group flex h-9 w-9 items-center justify-center rounded-lg border border-black/[0.08] bg-white text-muted-foreground hover:border-brand/40 hover:text-brand transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]" aria-hidden="true">
                  <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.8 0 0 .77 0 1.73v20.54C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
                </svg>
              </a>
              <a
                href="mailto:eddymax3715@gmail.com"
                aria-label="Email Eddy Max"
                className="group flex h-9 w-9 items-center justify-center rounded-lg border border-black/[0.08] bg-white text-muted-foreground hover:border-brand/40 hover:text-brand transition-colors"
              >
                <Mail className="h-[18px] w-[18px]" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-black/[0.06] py-7">
          <p className="text-[12px] text-muted-foreground/70">
            © {new Date().getFullYear()} PhishShield — Security Awareness Training Platform
          </p>
          <p className="text-[12px] text-muted-foreground/70">
            Designed &amp; built by{' '}
            <a
              href="https://eddy-max.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-brand hover:underline underline-offset-4"
            >
              Eddy Max Kilonzo
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
