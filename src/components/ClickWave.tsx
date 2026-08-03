import { useEffect, useRef } from 'react'

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export function ClickWave() {
  const layerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (import.meta.env.VITEST) return
    if (prefersReducedMotion()) return

    const layer = layerRef.current
    if (!layer) return

    const spawn = (event: PointerEvent) => {
      const size = Math.max(window.innerWidth, window.innerHeight) / 2.4

      const make = (delay: number, echo: boolean) => {
        const ring = document.createElement('span')
        ring.className = echo ? 'click-wave click-wave--echo' : 'click-wave'
        const ringSize = echo ? size * 0.62 : size
        ring.style.left = `${event.clientX}px`
        ring.style.top = `${event.clientY}px`
        ring.style.setProperty('--wave-size', `${ringSize}px`)
        if (delay > 0) ring.style.animationDelay = `${delay}ms`
        layer.appendChild(ring)
        ring.addEventListener('animationend', () => ring.remove())
      }

      make(0, false)
      make(90, true)

      if (layer.childElementCount > 16) {
        layer.replaceChildren()
      }
    }

    window.addEventListener('pointerdown', spawn)
    return () => window.removeEventListener('pointerdown', spawn)
  }, [])

  return <div ref={layerRef} className="click-wave-layer" aria-hidden="true" />
}
