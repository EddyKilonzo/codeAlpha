import type { MetadataRoute } from 'next'
import { MODULE_IDS } from '@/lib/constants'
import { SITE_URL } from '@/lib/site'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const staticRoutes = ['', '/dashboard', '/achievements', '/certificate-preview']
  const moduleRoutes = MODULE_IDS.map((id) => `/modules/${id}`)

  return [...staticRoutes, ...moduleRoutes].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: path === '' ? 1 : 0.7,
  }))
}
