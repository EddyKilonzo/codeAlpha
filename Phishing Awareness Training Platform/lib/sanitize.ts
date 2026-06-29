const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
}

export function escapeHtml(str: string): string {
  return str.replace(/[&<>"'/]/g, (ch) => HTML_ESCAPE_MAP[ch])
}

// Allows letters (including most Latin extended, accented chars), spaces,
// hyphens, apostrophes, and periods — covers virtually all real names.
const SAFE_NAME_RE = /^[a-zA-ZÀ-ÖØ-öø-ÿ\s'\-.]+$/

export type SanitizeResult = { value: string; error?: string }

export function sanitizeName(raw: string): SanitizeResult {
  const trimmed = raw.trim()
  if (trimmed.length === 0) return { value: '', error: 'Name is required' }
  if (trimmed.length < 2) return { value: trimmed, error: 'At least 2 characters required' }
  if (trimmed.length > 100) return { value: trimmed, error: 'Name must be 100 characters or fewer' }
  if (!SAFE_NAME_RE.test(trimmed)) {
    return {
      value: trimmed,
      error: 'Name may only contain letters, spaces, hyphens, apostrophes, and periods',
    }
  }
  return { value: trimmed }
}

export function sanitizeFilename(name: string): string {
  return name
    .trim()
    .replace(/[^a-zA-Z0-9\s\-_]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-')
    .slice(0, 80)
}
