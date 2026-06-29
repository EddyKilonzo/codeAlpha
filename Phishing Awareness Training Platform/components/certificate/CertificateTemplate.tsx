"use client"

import { forwardRef } from 'react'
import { ShieldCheck } from 'lucide-react'

export interface CertificateData {
  userName: string
  completionDate: string
  averageScore: number
  certificateId: string
  totalModules: number
}

// Decorative SVG corner ornament
function CornerOrnament({ rotate = 0 }: { rotate?: number }) {
  return (
    <svg
      width="56" height="56" viewBox="0 0 56 56" fill="none"
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <path d="M4 4 L4 24 M4 4 L24 4" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M4 4 L4 16 M4 4 L16 4" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <circle cx="4" cy="4" r="3" fill="#16a34a" />
    </svg>
  )
}

// Decorative divider line
function Divider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '0 auto', width: '60%' }}>
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #16a34a)' }} />
      <svg width="12" height="12" viewBox="0 0 12 12">
        <polygon points="6,0 12,6 6,12 0,6" fill="#16a34a" />
      </svg>
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #16a34a)' }} />
    </div>
  )
}

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
          position: 'relative',
          fontFamily: "'Georgia', 'Times New Roman', serif",
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {/* Outer border */}
        <div style={{
          position: 'absolute', inset: '10px',
          border: '3px solid #16a34a',
          borderRadius: '4px',
        }} />
        {/* Inner border */}
        <div style={{
          position: 'absolute', inset: '18px',
          border: '1px solid #16a34a',
          borderRadius: '2px',
          opacity: 0.4,
        }} />

        {/* Corner ornaments */}
        <div style={{ position: 'absolute', top: '6px', left: '6px' }}>
          <CornerOrnament rotate={0} />
        </div>
        <div style={{ position: 'absolute', top: '6px', right: '6px' }}>
          <CornerOrnament rotate={90} />
        </div>
        <div style={{ position: 'absolute', bottom: '6px', right: '6px' }}>
          <CornerOrnament rotate={180} />
        </div>
        <div style={{ position: 'absolute', bottom: '6px', left: '6px' }}>
          <CornerOrnament rotate={270} />
        </div>

        {/* Subtle background watermark */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: 0.025, pointerEvents: 'none',
        }}>
          <ShieldCheck style={{ width: '400px', height: '400px', color: '#16a34a' }} />
        </div>

        {/* Content */}
        <div style={{
          position: 'relative', zIndex: 1,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          height: '100%', padding: '32px 64px',
          gap: '0px',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <ShieldCheck style={{ width: '36px', height: '36px', color: '#16a34a' }} />
            <div>
              <div style={{
                fontSize: '22px', fontWeight: '900', color: '#16a34a',
                letterSpacing: '0.15em', fontFamily: "'Georgia', serif",
              }}>
                PHISHGUARD
              </div>
              <div style={{
                fontSize: '10px', color: '#64748b', letterSpacing: '0.25em',
                textTransform: 'uppercase', fontFamily: "'Arial', sans-serif",
                fontWeight: '600', marginTop: '1px',
              }}>
                Cyber Security Training Academy
              </div>
            </div>
          </div>

          {/* Divider */}
          <Divider />

          {/* Certificate of Completion */}
          <div style={{
            fontSize: '13px', color: '#64748b', letterSpacing: '0.3em',
            textTransform: 'uppercase', fontFamily: "'Arial', sans-serif",
            fontWeight: '600', margin: '14px 0 6px',
          }}>
            Certificate of Completion
          </div>

          {/* This certifies that */}
          <div style={{
            fontSize: '14px', color: '#475569',
            fontStyle: 'italic', marginBottom: '10px',
            fontFamily: "'Georgia', serif",
          }}>
            This certifies that
          </div>

          {/* Name */}
          <div style={{
            fontSize: '52px', fontWeight: '700', color: '#0f172a',
            letterSpacing: '-0.01em', lineHeight: '1',
            fontFamily: "'Georgia', 'Times New Roman', serif",
            textAlign: 'center', marginBottom: '10px',
          }}>
            {userName}
          </div>

          {/* Description */}
          <div style={{
            fontSize: '13px', color: '#475569', textAlign: 'center',
            maxWidth: '560px', lineHeight: '1.6',
            fontFamily: "'Georgia', serif", fontStyle: 'italic',
            marginBottom: '16px',
          }}>
            has successfully completed all six modules of the
            <span style={{ color: '#16a34a', fontWeight: '700', fontStyle: 'normal' }}>
              {' '}Phishing Awareness Training{' '}
            </span>
            course, demonstrating comprehensive knowledge of phishing threats and cyber defence practices.
          </div>

          {/* Divider */}
          <Divider />

          {/* Stats row */}
          <div style={{
            display: 'flex', gap: '48px', marginTop: '16px', marginBottom: '20px',
            fontFamily: "'Arial', sans-serif",
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: '600' }}>
                Average Score
              </div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#16a34a', marginTop: '2px' }}>
                {averageScore}%
              </div>
            </div>
            <div style={{ width: '1px', background: '#e2e8f0', alignSelf: 'stretch' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: '600' }}>
                Date Issued
              </div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginTop: '4px' }}>
                {completionDate}
              </div>
            </div>
            <div style={{ width: '1px', background: '#e2e8f0', alignSelf: 'stretch' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: '600' }}>
                Modules Completed
              </div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#16a34a', marginTop: '2px' }}>
                6 / 6
              </div>
            </div>
          </div>

          {/* Signature row */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', width: '100%',
            maxWidth: '700px', fontFamily: "'Arial', sans-serif",
          }}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{
                width: '180px', height: '1px', background: '#cbd5e1', margin: '0 auto 6px',
              }} />
              <div style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: '600' }}>
                Program Director
              </div>
              <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px', fontStyle: 'italic' }}>
                PhishGuard Academy
              </div>
            </div>

            {/* Certificate ID */}
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{
                display: 'inline-block',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                padding: '8px 16px',
                background: '#f8fafc',
              }}>
                <div style={{ fontSize: '8px', color: '#94a3b8', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: '600' }}>
                  Certificate ID
                </div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#475569', marginTop: '2px', fontFamily: 'monospace' }}>
                  {certificateId}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
)
