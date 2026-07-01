/**
 * Canonical site URL, used for metadata, OG tags, sitemap and robots.
 * Override at build time with NEXT_PUBLIC_SITE_URL for preview/other domains.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://phishshied.vercel.app'
).replace(/\/$/, '')

export const SITE_NAME = 'PhishShield'
export const SITE_DESCRIPTION =
  'Interactive cybersecurity awareness training platform. Learn to identify, avoid, and report phishing attacks through gamified modules, simulations, and quizzes.'
