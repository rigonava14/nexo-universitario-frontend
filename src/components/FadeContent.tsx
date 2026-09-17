import { CSSProperties, HTMLAttributes, ReactNode, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

type FadeContentProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  blur?: boolean
  duration?: number
  ease?: string
  delay?: number
  threshold?: number
  initialOpacity?: number
  style?: CSSProperties
}

/** React Bits FadeContent, adapted to TypeScript and reduced-motion preferences. */
export default function FadeContent({
  children,
  blur = false,
  duration = 0.55,
  ease = 'power2.out',
  delay = 0,
  threshold = 0.1,
  initialOpacity = 0,
  className = '',
  style,
  ...props
}: FadeContentProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(element, { clearProps: 'all' })
      return
    }

    gsap.set(element, {
      autoAlpha: initialOpacity,
      filter: blur ? 'blur(10px)' : 'blur(0px)',
      y: 10,
      willChange: 'opacity, filter, transform',
    })

    const animation = gsap.to(element, {
      autoAlpha: 1,
      filter: 'blur(0px)',
      y: 0,
      duration,
      delay,
      ease,
      paused: true,
      onComplete: () => gsap.set(element, { clearProps: 'willChange' }),
    })

    const trigger = ScrollTrigger.create({
      trigger: element,
      start: `top ${(1 - threshold) * 100}%`,
      once: true,
      onEnter: () => animation.play(),
    })

    return () => {
      trigger.kill()
      animation.kill()
      gsap.killTweensOf(element)
    }
  }, [blur, delay, duration, ease, initialOpacity, threshold])

  return <div ref={ref} className={className} style={style} {...props}>{children}</div>
}
