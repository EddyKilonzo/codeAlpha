"use client"

import { useEffect, useRef, type RefObject } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

/**
 * Traps keyboard focus inside `ref` while `active`, wires Escape to `onClose`,
 * and restores focus to the previously-focused element on close. Used for
 * modal dialogs and the mobile navigation drawer.
 */
export function useFocusTrap<T extends HTMLElement>(
  active: boolean,
  ref: RefObject<T | null>,
  onClose?: () => void
) {
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!active) return
    const node = ref.current
    if (!node) return

    previouslyFocused.current = document.activeElement as HTMLElement | null

    // Move focus into the dialog (first focusable, else the container itself).
    const focusables = () => Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.offsetParent !== null || el === document.activeElement
    )
    const first = focusables()[0]
    if (first) first.focus()
    else {
      node.setAttribute('tabindex', '-1')
      node.focus()
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose?.()
        return
      }
      if (e.key !== 'Tab') return
      const items = focusables()
      if (items.length === 0) {
        e.preventDefault()
        return
      }
      const firstEl = items[0]
      const lastEl = items[items.length - 1]
      const activeEl = document.activeElement
      if (e.shiftKey && (activeEl === firstEl || !node.contains(activeEl))) {
        e.preventDefault()
        lastEl.focus()
      } else if (!e.shiftKey && activeEl === lastEl) {
        e.preventDefault()
        firstEl.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      // Restore focus to whatever opened the dialog.
      previouslyFocused.current?.focus?.()
    }
  }, [active, ref, onClose])
}
