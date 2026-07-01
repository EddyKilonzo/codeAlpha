import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Providers } from '@/context/Providers'
import './globals.css'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
  preload: true,
  weight: ['400', '500', '600', '700', '800'],
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
  preload: false,
  weight: ['400', '500', '700'],
})

export const metadata: Metadata = {
  title: {
    default: 'PhishShield — Phishing Awareness Training',
    template: '%s | PhishShield',
  },
  description:
    'Interactive cybersecurity awareness training platform. Learn to identify, avoid, and report phishing attacks through gamified modules, simulations, and quizzes.',
  keywords: ['phishing', 'cybersecurity', 'awareness training', 'security'],
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        {/* Skip to main content */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none"
        >
          Skip to main content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
