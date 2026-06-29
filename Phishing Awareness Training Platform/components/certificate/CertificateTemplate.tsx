"use client"

import { forwardRef } from 'react'

export interface CertificateData {
  userName: string
  completionDate: string
  averageScore: number
  certificateId: string
  totalModules: number
}

// ── SVG diagonal security grid encoded as data URI ───────────────────────────
const SECURITY_PATTERN = `url("data:image/svg+xml,${encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28'>
  <path d='M 0,28 L 28,0' stroke='%2316a34a' stroke-width='0.6' stroke-opacity='0.08'/>
  <path d='M -7,7 L 7,-7' stroke='%2316a34a' stroke-width='0.6' stroke-opacity='0.08'/>
  <path d='M 21,35 L 35,21' stroke='%2316a34a' stroke-width='0.6' stroke-opacity='0.08'/>
  <circle cx='0' cy='0' r='1.2' fill='%2316a34a' fill-opacity='0.07'/>
  <circle cx='28' cy='28' r='1.2' fill='%2316a34a' fill-opacity='0.07'/>
  <circle cx='0' cy='28' r='0.8' fill='%2316a34a' fill-opacity='0.05'/>
  <circle cx='28' cy='0' r='0.8' fill='%2316a34a' fill-opacity='0.05'/>
</svg>
`)}")`

// ── Corner ornament ───────────────────────────────────────────────────────────
function CornerOrnament({ rotate = 0 }: { rotate?: number }) {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" style={{ transform: `rotate(${rotate}deg)` }}>
      <path d="M4 4 L4 26 M4 4 L26 4" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M4 4 L4 16 M4 4 L16 4" stroke="#16a34a" strokeWidth="1.2" strokeLinecap="round" opacity="0.45" />
      <path d="M4 4 L4 8 M4 4 L8 4" stroke="#16a34a" strokeWidth="0.8" strokeLinecap="round" opacity="0.25" />
      <circle cx="4" cy="4" r="3.5" fill="#16a34a" />
    </svg>
  )
}

// ── Divider ───────────────────────────────────────────────────────────────────
function Divider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '0 auto', width: '65%' }}>
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #16a34a55)' }} />
      <svg width="14" height="14" viewBox="0 0 14 14">
        <polygon points="7,0 14,7 7,14 0,7" fill="#16a34a" opacity="0.7" />
        <polygon points="7,3 11,7 7,11 3,7" fill="white" />
      </svg>
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #16a34a55)' }} />
    </div>
  )
}

// ── Completion seal SVG ───────────────────────────────────────────────────────
function CompletionSeal() {
  // 18-spoke sunburst polygon
  const spokes = 18
  const outerR = 55, innerR = 48
  const cx = 60, cy = 60
  const points = Array.from({ length: spokes * 2 }, (_, i) => {
    const angle = (i * Math.PI) / spokes - Math.PI / 2
    const r = i % 2 === 0 ? outerR : innerR
    return `${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`
  }).join(' ')

  return (
    <svg
      width="120" height="120"
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0 4px 16px rgba(22,163,74,0.45))' }}
    >
      {/* Outer sunburst */}
      <polygon points={points} fill="#16a34a" />

      {/* White separator ring */}
      <circle cx="60" cy="60" r="45" fill="white" />

      {/* Brand ring */}
      <circle cx="60" cy="60" r="42" fill="#16a34a" />

      {/* Fine dashed inner ring */}
      <circle cx="60" cy="60" r="39" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1" strokeDasharray="3 2.5" />

      {/* White center */}
      <circle cx="60" cy="60" r="33" fill="white" />

      {/* Inner brand accent ring */}
      <circle cx="60" cy="60" r="31" fill="none" stroke="#16a34a" strokeWidth="1.5" />

      {/* Shield path */}
      <path
        d="M 60,27 L 46,32 L 46,46 Q 46,56 60,62 Q 74,56 74,46 L 74,32 Z"
        fill="#16a34a" opacity="0.12"
      />
      {/* Checkmark */}
      <path
        d="M 50,53 L 56.5,60 L 71,45"
        stroke="#16a34a" strokeWidth="3.5"
        strokeLinecap="round" strokeLinejoin="round"
        fill="none"
      />

      {/* Year */}
      <text
        x="60" y="73"
        textAnchor="middle"
        fontSize="8"
        fill="#16a34a"
        fontWeight="700"
        fontFamily="Arial, sans-serif"
        letterSpacing="1.5"
      >
        2026
      </text>

      {/* CERTIFIED label on outer brand ring — top */}
      <text
        x="60" y="25"
        textAnchor="middle"
        fontSize="6.5"
        fill="white"
        fontWeight="900"
        fontFamily="Arial, sans-serif"
        letterSpacing="2"
      >
        CERTIFIED
      </text>

      {/* COMPLETE label on outer brand ring — bottom */}
      <text
        x="60" y="98"
        textAnchor="middle"
        fontSize="6.5"
        fill="white"
        fontWeight="900"
        fontFamily="Arial, sans-serif"
        letterSpacing="2"
      >
        COMPLETE
      </text>

      {/* Left star dot */}
      <circle cx="22" cy="60" r="2" fill="rgba(255,255,255,0.6)" />
      {/* Right star dot */}
      <circle cx="98" cy="60" r="2" fill="rgba(255,255,255,0.6)" />
    </svg>
  )
}

// ── Main template ─────────────────────────────────────────────────────────────
export const CertificateTemplate = forwardRef<HTMLDivElement, { data: CertificateData }>(
  function CertificateTemplate({ data }, ref) {
    const { userName, completionDate, averageScore, certificateId } = data

    return (
      <div
        ref={ref}
        style={{
          width: '900px',
          height: '640px',
          background: '#ffffff',
          backgroundImage: SECURITY_PATTERN,
          backgroundRepeat: 'repeat',
          position: 'relative',
          fontFamily: "'Georgia', 'Times New Roman', serif",
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {/* Radial highlight to keep center readable */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 70% 80% at 50% 50%, rgba(255,255,255,0.96) 40%, rgba(255,255,255,0.80) 100%)',
          pointerEvents: 'none',
        }} />

        {/* Outer border */}
        <div style={{ position: 'absolute', inset: '10px', border: '3px solid #16a34a', borderRadius: '4px' }} />
        {/* Inner border */}
        <div style={{ position: 'absolute', inset: '18px', border: '1px solid #16a34a', borderRadius: '2px', opacity: 0.35 }} />

        {/* Corner ornaments */}
        <div style={{ position: 'absolute', top: '4px', left: '4px' }}><CornerOrnament rotate={0} /></div>
        <div style={{ position: 'absolute', top: '4px', right: '4px' }}><CornerOrnament rotate={90} /></div>
        <div style={{ position: 'absolute', bottom: '4px', right: '4px' }}><CornerOrnament rotate={180} /></div>
        <div style={{ position: 'absolute', bottom: '4px', left: '4px' }}><CornerOrnament rotate={270} /></div>

        {/* Completion seal — bottom right */}
        <div style={{ position: 'absolute', bottom: '32px', right: '52px', opacity: 0.92 }}>
          <CompletionSeal />
        </div>

        {/* Content */}
        <div style={{
          position: 'relative', zIndex: 1,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          height: '100%', padding: '32px 64px',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
            {/* Logo — html2canvas captures img tags via useCORS: true */}
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', overflow: 'hidden', background: '#fff', border: '1.5px solid rgba(22,163,74,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 1px 6px rgba(22,163,74,0.15)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="PhishShield" width={40} height={40} style={{ objectFit: 'contain', display: 'block' }} />
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#16a34a', letterSpacing: '0.15em', fontFamily: "'Georgia', serif" }}>
                PHISHSHIELD
              </div>
              <div style={{ fontSize: '10px', color: '#64748b', letterSpacing: '0.28em', textTransform: 'uppercase', fontFamily: "'Arial', sans-serif", fontWeight: '600', marginTop: '1px' }}>
                Cyber Security Training Academy
              </div>
            </div>
          </div>

          <Divider />

          <div style={{ fontSize: '13px', color: '#64748b', letterSpacing: '0.3em', textTransform: 'uppercase', fontFamily: "'Arial', sans-serif", fontWeight: '600', margin: '14px 0 6px' }}>
            Certificate of Completion
          </div>

          <div style={{ fontSize: '14px', color: '#475569', fontStyle: 'italic', marginBottom: '10px', fontFamily: "'Georgia', serif" }}>
            This certifies that
          </div>

          <div style={{ fontSize: '54px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.01em', lineHeight: '1', fontFamily: "'Georgia', 'Times New Roman', serif", textAlign: 'center', marginBottom: '10px' }}>
            {userName}
          </div>

          <div style={{ fontSize: '13px', color: '#475569', textAlign: 'center', maxWidth: '520px', lineHeight: '1.65', fontFamily: "'Georgia', serif", fontStyle: 'italic', marginBottom: '16px' }}>
            has successfully completed all six modules of the
            <span style={{ color: '#16a34a', fontWeight: '700', fontStyle: 'normal' }}> Phishing Awareness Training </span>
            course, demonstrating comprehensive knowledge of phishing threats and cyber defence practices.
          </div>

          <Divider />

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '48px', marginTop: '16px', marginBottom: '22px', fontFamily: "'Arial', sans-serif" }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: '600' }}>Average Score</div>
              <div style={{ fontSize: '26px', fontWeight: '800', color: '#16a34a', marginTop: '2px' }}>{averageScore}%</div>
            </div>
            <div style={{ width: '1px', background: '#e2e8f0', alignSelf: 'stretch' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: '600' }}>Date Issued</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginTop: '4px' }}>{completionDate}</div>
            </div>
            <div style={{ width: '1px', background: '#e2e8f0', alignSelf: 'stretch' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: '600' }}>Modules Completed</div>
              <div style={{ fontSize: '26px', fontWeight: '800', color: '#16a34a', marginTop: '2px' }}>6 / 6</div>
            </div>
          </div>

          {/* Signature row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '660px', fontFamily: "'Arial', sans-serif" }}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ width: '180px', height: '1px', background: '#cbd5e1', margin: '0 auto 6px' }} />
              <div style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: '600' }}>Program Director</div>
              <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px', fontStyle: 'italic' }}>PhishShield Academy</div>
            </div>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ display: 'inline-block', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '8px 16px', background: '#f8fafc' }}>
                <div style={{ fontSize: '8px', color: '#94a3b8', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: '600' }}>Certificate ID</div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#475569', marginTop: '2px', fontFamily: 'monospace' }}>{certificateId}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
)
