import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  hue: string
  life: number
  decay: number
}

function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace('#', '')
  const full =
    value.length === 3
      ? value
          .split('')
          .map((c) => c + c)
          .join('')
      : value
  const num = parseInt(full, 16)
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export function EmberBurst({ burstKey, color }: { burstKey: number; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (burstKey === 0) return
    if (prefersReducedMotion()) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const dpr = window.devicePixelRatio || 1
    const width = window.innerWidth
    const height = window.innerHeight
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.scale(dpr, dpr)

    const [r, g, b] = hexToRgb(color)
    const originX = width / 2
    const originY = height * 0.42

    const particles: Particle[] = []
    const count = 130
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2
      const speed = 2 + Math.random() * 7
      particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: 2 + Math.random() * 4,
        hue: Math.random() < 0.25 ? `rgba(255, ${Math.round(180 + Math.random() * 60)}, 90, 1)` : `rgba(${r}, ${g}, ${b}, 1)`,
        life: 1,
        decay: 0.008 + Math.random() * 0.012,
      })
    }

    let frame = 0
    const maxFrames = 150
    let animationId = 0

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      frame += 1

      for (const p of particles) {
        p.life -= p.decay
        p.vy += 0.12
        p.vx *= 0.985
        p.x += p.vx
        p.y += p.vy

        if (p.life <= 0) continue
        ctx.globalAlpha = Math.max(0, p.life)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
        ctx.fillStyle = p.hue
        ctx.fill()
      }

      if (frame < maxFrames) {
        animationId = requestAnimationFrame(draw)
      } else {
        ctx.clearRect(0, 0, width, height)
      }
    }

    animationId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animationId)
  }, [burstKey, color])

  return <canvas ref={canvasRef} className="burst" aria-hidden="true" />
}
