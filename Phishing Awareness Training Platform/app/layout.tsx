import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Providers } from '@/context/Providers'
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '@/lib/site'
import './globals.css'

// Geist ships as a single variable font — loading it that way (no explicit
// weight list) delivers every weight, including 900 (font-black), in one file.
const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
  preload: true,
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
  preload: false,
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'PhishShield — Phishing Awareness Training',
    template: '%s | PhishShield',
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ['phishing', 'cybersecurity', 'awareness training', 'security', 'phishing training', 'security awareness'],
  authors: [{ name: 'Eddy Max Kilonzo', url: 'https://eddy-max.vercel.app/' }],
  creator: 'Eddy Max Kilonzo',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/logo.png',
    apple: '/apple-icon.png',
  },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: 'PhishShield — Phishing Awareness Training',
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: 'en_US',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'PhishShield — Learn to Spot It. Stop the Attack.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PhishShield — Phishing Awareness Training',
    description: SITE_DESCRIPTION,
    images: ['/og.png'],
  },
}

export const viewport: Viewport = {
  themeColor: '#16a34a',
  colorScheme: 'light',
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
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
