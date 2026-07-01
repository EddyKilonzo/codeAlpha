import { describe, it, expect } from 'vitest'
import { escapeHtml, sanitizeName, sanitizeFilename } from '@/lib/sanitize'

describe('escapeHtml', () => {
  it('escapes HTML-significant characters', () => {
    expect(escapeHtml('<script>alert("x")</script>')).toBe(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;&#x2F;script&gt;'
    )
    expect(escapeHtml("a & b's")).toBe('a &amp; b&#x27;s')
  })
})

describe('sanitizeName', () => {
  it('rejects empty and too-short names', () => {
    expect(sanitizeName('   ').error).toBe('Name is required')
    expect(sanitizeName('A').error).toBe('At least 2 characters required')
  })
  it('rejects overly long names', () => {
    expect(sanitizeName('a'.repeat(101)).error).toMatch(/100 characters/)
  })
  it('rejects names with disallowed characters', () => {
    expect(sanitizeName('John3').error).toBeDefined()
    expect(sanitizeName('<b>hi</b>').error).toBeDefined()
  })
  it('accepts real names and trims', () => {
    expect(sanitizeName('  Jane Smith  ')).toEqual({ value: 'Jane Smith' })
    expect(sanitizeName("O'Brien-Smith").error).toBeUndefined()
    expect(sanitizeName('José Núñez').error).toBeUndefined()
  })
})

describe('sanitizeFilename', () => {
  it('strips unsafe characters and collapses spaces to single hyphens', () => {
    expect(sanitizeFilename('Jane Smith!!')).toBe('Jane-Smith')
    expect(sanitizeFilename('a   b')).toBe('a-b')
    expect(sanitizeFilename('../../etc/passwd')).toBe('etcpasswd')
  })
  it('caps length at 80 characters', () => {
    expect(sanitizeFilename('a'.repeat(200)).length).toBe(80)
  })
})
