"use client"

import { forwardRef, useEffect, useRef } from 'react'

export interface CertificateData {
  userName: string
  completionDate: string
  averageScore: number
  certificateId: string
  totalModules: number
}

// ── Canvas-based decorative patterns ──────────────────────────────────────────
// html2canvas 1.4.1 fails on:
//   1. SVG data-URL CSS backgrounds  → createPattern 0×0 error
//   2. Inline <svg> with no explicit height attr → svg.height.baseVal.value = 0
// Canvas elements avoid both: html2canvas copies their pixels directly via drawImage.
// NOTE: cloneNode() does NOT copy canvas pixels. CertificateModal.handleDownload
// manually copies each canvas from the live template into the clone before capture.

export function drawHexGrid(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.strokeStyle = 'rgba(22,163,74,0.20)'
  ctx.lineWidth = 1
  const r = 20
  const colW = r * Math.sqrt(3)  // ~34.64 horizontal spacing
  const rowH = r * 1.5           // 30    vertical spacing
  const drawHex = (cx: number, cy: number) => {
    ctx.beginPath()
    for (let i = 0; i < 6; i++) {
      const a = (i * 60 - 30) * Math.PI / 180
      const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a)
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.closePath(); ctx.stroke()
  }
  for (let row = -1; row <= Math.ceil(640 / rowH) + 1; row++) {
    const cy = row * rowH
    const offset = Math.abs(row % 2) === 1 ? colW / 2 : 0
    for (let col = -1; col <= Math.ceil(900 / colW) + 1; col++) {
      drawHex(col * colW + offset, cy)
    }
  }
}

export function drawWaveStrip(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const H = canvas.height
  const PERIOD = 80
  const reps = Math.ceil(H / PERIOD) + 1
  for (let i = 0; i < reps; i++) {
    const y = i * PERIOD
    ctx.strokeStyle = 'rgba(22,163,74,0.18)'; ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.moveTo(10, y)
    ctx.quadraticCurveTo(18, y + 10, 10, y + 20)
    ctx.quadraticCurveTo(2,  y + 30, 10, y + 40)
    ctx.quadraticCurveTo(18, y + 50, 10, y + 60)
    ctx.quadraticCurveTo(2,  y + 70, 10, y + 80)
    ctx.stroke()

    ctx.strokeStyle = 'rgba(22,163,74,0.08)'; ctx.lineWidth = 0.6
    ctx.beginPath()
    ctx.moveTo(4, y)
    ctx.quadraticCurveTo(12, y + 10,  4, y + 20)
    ctx.quadraticCurveTo(-4, y + 30,  4, y + 40)
    ctx.quadraticCurveTo(12, y + 50,  4, y + 60)
    ctx.quadraticCurveTo(-4, y + 70,  4, y + 80)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(16, y)
    ctx.quadraticCurveTo(8,  y + 10, 16, y + 20)
    ctx.quadraticCurveTo(24, y + 30, 16, y + 40)
    ctx.quadraticCurveTo(8,  y + 50, 16, y + 60)
    ctx.quadraticCurveTo(24, y + 70, 16, y + 80)
    ctx.stroke()
  }
}

function HexBackground() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => { if (ref.current) drawHexGrid(ref.current) }, [])
  return (
    <canvas
      ref={ref}
      data-cert-pattern="hex"
      width={900}
      height={640}
      style={{ position: 'absolute', top: 0, left: 0, width: '900px', height: '640px' }}
    />
  )
}

function WaveBorderCanvas({ flip = false }: { flip?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => { if (ref.current) drawWaveStrip(ref.current) }, [])
  return (
    <canvas
      ref={ref}
      data-cert-pattern="wave"
      width={22}
      height={620}
      style={{
        position: 'absolute',
        top: '10px',
        [flip ? 'right' : 'left']: '10px',
        width: '22px',
        height: '620px',
        opacity: 0.65,
        ...(flip ? { transform: 'scaleX(-1)' } : {}),
      }}
    />
  )
}

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

// ── Completion seal ───────────────────────────────────────────────────────────
function CompletionSeal() {
  const spokes = 18
  const outerR = 55, innerR = 48
  const cx = 60, cy = 60
  const points = Array.from({ length: spokes * 2 }, (_, i) => {
    const angle = (i * Math.PI) / spokes - Math.PI / 2
    const r = i % 2 === 0 ? outerR : innerR
    return `${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`
  }).join(' ')

  return (
    <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <polygon points={points} fill="#16a34a" />
      <circle cx="60" cy="60" r="45" fill="white" />
      <circle cx="60" cy="60" r="42" fill="#16a34a" />
      <circle cx="60" cy="60" r="39" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1" strokeDasharray="3 2.5" />
      <circle cx="60" cy="60" r="33" fill="white" />
      <circle cx="60" cy="60" r="31" fill="none" stroke="#16a34a" strokeWidth="1.5" />
      <path d="M 60,27 L 46,32 L 46,46 Q 46,56 60,62 Q 74,56 74,46 L 74,32 Z" fill="#16a34a" opacity="0.12" />
      <path d="M 50,53 L 56.5,60 L 71,45" stroke="#16a34a" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <text x="60" y="73" textAnchor="middle" fontSize="8" fill="#16a34a" fontWeight="700" fontFamily="Arial, sans-serif" letterSpacing="1.5">2026</text>
      <text x="60" y="25" textAnchor="middle" fontSize="6.5" fill="white" fontWeight="900" fontFamily="Arial, sans-serif" letterSpacing="2">CERTIFIED</text>
      <text x="60" y="98" textAnchor="middle" fontSize="6.5" fill="white" fontWeight="900" fontFamily="Arial, sans-serif" letterSpacing="2">COMPLETE</text>
      <circle cx="22" cy="60" r="2" fill="rgba(255,255,255,0.6)" />
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
          backgroundColor: '#fcfaf7',
          position: 'relative',
          fontFamily: "'Georgia', 'Times New Roman', serif",
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {/* Canvas-based patterns — pixel data is manually copied into the clone */}
        <HexBackground />
        <WaveBorderCanvas />
        <WaveBorderCanvas flip />

        {/* Radial highlight — fades hex grid toward center */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 60% 65% at 50% 50%, rgba(252,250,247,0.94) 30%, rgba(252,250,247,0.55) 65%, transparent 100%)',
          pointerEvents: 'none',
        }} />

        {/* Corner vignette */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 120% 120% at 50% 50%, transparent 55%, rgba(22,163,74,0.04) 100%)',
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

        {/* Completion seal */}
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

          {/* Signature + certificate ID row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '660px', fontFamily: "'Arial', sans-serif" }}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ width: '180px', height: '1px', background: '#cbd5e1', margin: '0 auto 6px' }} />
              <div style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: '600' }}>Program Director</div>
              <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px', fontStyle: 'italic' }}>PhishShield Academy</div>
            </div>
            <div style={{ textAlign: 'center', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
