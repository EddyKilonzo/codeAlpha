"use client"

import { useEffect, useMemo, useRef, type ReactNode, type RefObject, type ElementType } from 'react'

import './ScrollFloat.css'

interface ScrollFloatProps {
  children: ReactNode
  /** Element to render as the container. Defaults to an <h2>. */
  tag?: ElementType
  scrollContainerRef?: RefObject<HTMLElement>
  containerClassName?: string
  textClassName?: string
  animationDuration?: number
  ease?: string
  scrollStart?: string
  scrollEnd?: string
  stagger?: number
}

const ScrollFloat = ({
  children,
  tag: Tag = 'h2',
  scrollContainerRef,
  containerClassName = '',
  textClassName = '',
  animationDuration = 1,
  ease = 'back.inOut(2)',
  scrollStart = 'center bottom+=50%',
  scrollEnd = 'bottom bottom-=40%',
  stagger = 0.03,
}: ScrollFloatProps) => {
  const containerRef = useRef<HTMLElement>(null)

  const splitText = useMemo(() => {
    const text = typeof children === 'string' ? children : ''
    // Split on whitespace but keep the separators so each word can be wrapped in a
    // non-breaking span. Characters stay inline-block for the animation, but a line
    // break can only fall between words — never mid-word (fixes mobile jumbling).
    const tokens = text.split(/(s+)/)
    return tokens.map((token, tokenIndex) => {
      if (token === '') return null
      if (/^s+$/.test(token)) {
        return <span key={`space-${tokenIndex}`}>{' '}</span>
      }
      return (
        <span className="word" key={`word-${tokenIndex}`}>
          {token.split('').map((char, charIndex) => (
            <span className="char" key={charIndex}>
              {char}
            </span>
          ))}
        </span>
      )
    })
  }, [children])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // Respect reduced-motion: leave the (already rendered) text static, no gsap.
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    let cancelled = false
    let tween: { kill: () => void; scrollTrigger?: { kill: () => void } } | null = null

    // Load gsap lazily so it isn't part of the initial page bundle. The heading
    // text is already rendered; the animation just enhances it once gsap arrives.
    ;(async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ])
      if (cancelled || !containerRef.current) return
      gsap.registerPlugin(ScrollTrigger)

      const scroller = scrollContainerRef && scrollContainerRef.current ? scrollContainerRef.current : window
      const charElements = el.querySelectorAll('.char')

      tween = gsap.fromTo(
        charElements,
        {
          willChange: 'opacity, transform',
          opacity: 0,
          yPercent: 120,
          scaleY: 2.3,
          scaleX: 0.7,
          transformOrigin: '50% 0%',
        },
        {
          duration: animationDuration,
          ease: ease,
          opacity: 1,
          yPercent: 0,
          scaleY: 1,
          scaleX: 1,
          stagger: stagger,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: scrollStart,
            end: scrollEnd,
            scrub: true,
          },
        }
      )
    })()

    return () => {
      cancelled = true
      tween?.scrollTrigger?.kill()
      tween?.kill()
    }
  }, [scrollContainerRef, animationDuration, ease, scrollStart, scrollEnd, stagger])

  const label = typeof children === 'string' ? children : undefined

  return (
    // Expose the plain text to screen readers via aria-label and hide the
    // per-character spans, so assistive tech reads "Finish the course" rather
    // than spelling it out letter by letter.
    <Tag ref={containerRef} className={`scroll-float ${containerClassName}`} aria-label={label}>
      <span className={`scroll-float-text ${textClassName}`} aria-hidden="true">{splitText}</span>
    </Tag>
  )
}

export default ScrollFloat
