import { useEffect, useRef } from 'react'

interface Shard {
  x: number
  y: number
  size: number
  ampX: number
  ampY: number
  z: number
  zAmp: number
  r: number
  ampRot: number
  period: number
  phase: number
  opacity: number
  from: string
  to: string
  clip: string
}

const SHARDS: Shard[] = [
  {
    x: 4, y: 12, size: 34, ampX: 5, ampY: -4, z: -80, zAmp: 26, r: 14, ampRot: -10,
    period: 13, phase: 0, opacity: 0.95,
    from: 'var(--poly-a)', to: 'var(--poly-b)',
    clip: 'polygon(0 0, 100% 10%, 86% 100%, 6% 88%)',
  },
  {
    x: 74, y: 6, size: 30, ampX: -5, ampY: 5, z: -40, zAmp: 20, r: -22, ampRot: 12,
    period: 15, phase: 1.2, opacity: 0.85,
    from: 'var(--poly-a)', to: 'var(--poly-c)',
    clip: 'polygon(100% 0, 100% 78%, 52% 100%, 0 62%, 20% 0)',
  },
  {
    x: -6, y: 58, size: 42, ampX: 7, ampY: 4, z: -120, zAmp: 30, r: 28, ampRot: -18,
    period: 17, phase: 2.1, opacity: 0.7,
    from: 'var(--poly-b)', to: 'var(--poly-c)',
    clip: 'polygon(0 0, 100% 18%, 92% 100%, 0 92%)',
  },
  {
    x: 62, y: 60, size: 28, ampX: 4, ampY: -6, z: -60, zAmp: 22, r: -8, ampRot: 16,
    period: 12, phase: 3.4, opacity: 0.9,
    from: 'var(--poly-a)', to: 'var(--poly-d)',
    clip: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)',
  },
  {
    x: 30, y: 4, size: 13, ampX: 3, ampY: 5, z: -140, zAmp: 18, r: 42, ampRot: -24,
    period: 19, phase: 0.6, opacity: 0.6,
    from: 'var(--poly-a)', to: 'var(--poly-b)',
    clip: 'polygon(0 0, 100% 25%, 75% 100%, 0 70%)',
  },
  {
    x: 84, y: 42, size: 12, ampX: -6, ampY: 5, z: -100, zAmp: 16, r: 16, ampRot: -12,
    period: 14, phase: 2.8, opacity: 0.85,
    from: 'var(--poly-a)', to: 'var(--poly-c)',
    clip: 'polygon(0 30%, 100% 0, 78% 100%, 0 76%)',
  },
  {
    x: 18, y: 72, size: 10, ampX: 5, ampY: -4, z: -50, zAmp: 14, r: -34, ampRot: 20,
    period: 16, phase: 4.2, opacity: 0.7,
    from: 'var(--poly-a)', to: 'var(--poly-b)',
    clip: 'polygon(50% 0, 100% 100%, 0 100%)',
  },
  {
    x: 45, y: 84, size: 16, ampX: 3, ampY: 3, z: -90, zAmp: 18, r: 8, ampRot: -14,
    period: 11, phase: 1.8, opacity: 0.6,
    from: 'var(--poly-b)', to: 'var(--poly-d)',
    clip: 'polygon(0 0, 100% 12%, 88% 100%, 0 82%)',
  },
  {
    x: 88, y: 78, size: 8, ampX: 4, ampY: -3, z: -70, zAmp: 12, r: 24, ampRot: -18,
    period: 13, phase: 5.1, opacity: 0.75,
    from: 'var(--poly-a)', to: 'var(--poly-b)',
    clip: 'polygon(0 20%, 100% 0, 72% 100%, 0 68%)',
  },
  {
    x: 8, y: 40, size: 18, ampX: 6, ampY: 3, z: -110, zAmp: 20, r: -12, ampRot: 10,
    period: 18, phase: 0.3, opacity: 0.55,
    from: 'var(--poly-a)', to: 'var(--poly-d)',
    clip: 'polygon(50% 0, 100% 100%, 0 100%)',
  },
  {
    x: 55, y: 26, size: 26, ampX: 3, ampY: -5, z: -30, zAmp: 16, r: 6, ampRot: -8,
    period: 14, phase: 3.9, opacity: 0.65,
    from: 'var(--poly-a)', to: 'var(--poly-b)',
    clip: 'polygon(0 0, 100% 8%, 90% 100%, 0 90%)',
  },
  {
    x: 92, y: 16, size: 7, ampX: 4, ampY: 3, z: -60, zAmp: 10, r: 20, ampRot: -16,
    period: 12, phase: 2.4, opacity: 0.7,
    from: 'var(--poly-a)', to: 'var(--poly-b)',
    clip: 'polygon(50% 0, 100% 100%, 0 100%)',
  },
  {
    x: 22, y: 30, size: 11, ampX: 3, ampY: 4, z: -90, zAmp: 14, r: -28, ampRot: 14,
    period: 15, phase: 4.7, opacity: 0.6,
    from: 'var(--poly-a)', to: 'var(--poly-c)',
    clip: 'polygon(0 0, 100% 18%, 84% 100%, 0 76%)',
  },
  {
    x: 68, y: 82, size: 14, ampX: -4, ampY: 4, z: -80, zAmp: 16, r: 12, ampRot: -10,
    period: 17, phase: 1.1, opacity: 0.65,
    from: 'var(--poly-b)', to: 'var(--poly-c)',
    clip: 'polygon(0 20%, 100% 0, 90% 100%, 0 80%)',
  },
  {
    x: 12, y: 86, size: 20, ampX: 5, ampY: -3, z: -100, zAmp: 18, r: -16, ampRot: 12,
    period: 13, phase: 5.6, opacity: 0.5,
    from: 'var(--poly-b)', to: 'var(--poly-d)',
    clip: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)',
  },
  {
    x: 47, y: 14, size: 8, ampX: 4, ampY: 3, z: -120, zAmp: 12, r: 36, ampRot: -20,
    period: 16, phase: 3.1, opacity: 0.7,
    from: 'var(--poly-a)', to: 'var(--poly-b)',
    clip: 'polygon(0 0, 100% 25%, 75% 100%, 0 70%)',
  },
  {
    x: 80, y: 24, size: 10, ampX: -3, ampY: 4, z: -50, zAmp: 12, r: -8, ampRot: 10,
    period: 14, phase: 2.0, opacity: 0.75,
    from: 'var(--poly-a)', to: 'var(--poly-c)',
    clip: 'polygon(0 30%, 100% 0, 78% 100%, 0 76%)',
  },
  {
    x: 33, y: 62, size: 9, ampX: 3, ampY: -4, z: -130, zAmp: 12, r: 14, ampRot: -12,
    period: 15, phase: 0.9, opacity: 0.55,
    from: 'var(--poly-a)', to: 'var(--poly-b)',
    clip: 'polygon(50% 0, 100% 100%, 0 100%)',
  },
]

interface Ripple {
  x: number
  y: number
  radius: number
  maxRadius: number
  speed: number
  strength: number
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export function Background3D({ accent }: { accent: string }) {
  const shardRefs = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    if (import.meta.env.VITEST) return
    if (prefersReducedMotion()) return

    let vw = window.innerWidth
    let vh = window.innerHeight
    let vmin = Math.min(vw, vh) / 100

    const remeasure = () => {
      vw = window.innerWidth
      vh = window.innerHeight
      vmin = Math.min(vw, vh) / 100
    }

    const shardPhys = SHARDS.map(() => ({ x: 0, y: 0, vx: 0, vy: 0 }))
    const centers = Array.from({ length: SHARDS.length }, () => ({ x: 0, y: 0, r: 0 }))
    let ripples: Ripple[] = []
    let pointer = { x: 0, y: 0, active: false }
    let last = performance.now()
    let raf = 0

    // Newtonian physics constants
    const REF_SIZE = 16
    const mass = (size: number) => (size / REF_SIZE) ** 2
    const HOVER_ACC = 1.8
    const RESTITUTION = 0.9
    const COLLISION_E = 0.9
    const CORRECTION = 0.35
    const MAX_SPEED = 40

    const compute = () => {
      const now = performance.now()
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const f = dt * 60

      for (const rp of ripples) rp.radius += rp.speed * f

      for (let i = 0; i < SHARDS.length; i += 1) {
        const el = shardRefs.current[i]
        if (!el) continue
        const s = SHARDS[i]
        const sizePx = s.size * vmin
        const m = mass(s.size)
        const baseX = (s.x / 100) * vw
        const baseY = (s.y / 100) * vh
        const t = ((now / 1000) / s.period) * Math.PI * 2 + s.phase
        const fx = Math.sin(t) * s.ampX * vmin
        const fy = Math.cos(t) * s.ampY * vmin

        const phys = shardPhys[i]
        const cx = baseX + fx + phys.x + sizePx / 2
        const cy = baseY + fy + phys.y + sizePx / 2

        if (pointer.active) {
          const dx = cx - pointer.x
          const dy = cy - pointer.y
          const d2 = dx * dx + dy * dy
          const radius = Math.max(180, sizePx * 1.5)
          if (d2 < radius * radius && d2 > 0) {
            const dist = Math.sqrt(d2)
            const force = 1 - dist / radius
            phys.vx += ((dx / dist) * HOVER_ACC * force) / m * f
            phys.vy += ((dy / dist) * HOVER_ACC * force) / m * f
          }
        }

        for (const rp of ripples) {
          const dx = cx - rp.x
          const dy = cy - rp.y
          const d2 = dx * dx + dy * dy
          const band = 130
          const minR = rp.radius
          const maxR = minR + band
          if (d2 >= minR * minR && d2 < maxR * maxR && d2 > 0) {
            const dist = Math.sqrt(d2)
            const falloff = 1 - (dist - minR) / band
            phys.vx += ((dx / dist) * rp.strength * falloff) / m * f
            phys.vy += ((dy / dist) * rp.strength * falloff) / m * f
          }
        }

        phys.x += phys.vx * f
        phys.y += phys.vy * f

        const speed2 = phys.vx * phys.vx + phys.vy * phys.vy
        if (speed2 > MAX_SPEED * MAX_SPEED) {
          const speed = Math.sqrt(speed2)
          phys.vx *= MAX_SPEED / speed
          phys.vy *= MAX_SPEED / speed
        }

        const minX = baseX + fx + phys.x
        const maxX = minX + sizePx
        const minY = baseY + fy + phys.y
        const maxY = minY + sizePx
        if (minX < 0) {
          phys.x = -baseX - fx
          phys.vx = Math.abs(phys.vx) * RESTITUTION
        } else if (maxX > vw) {
          phys.x = vw - sizePx - baseX - fx
          phys.vx = -Math.abs(phys.vx) * RESTITUTION
        }
        if (minY < 0) {
          phys.y = -baseY - fy
          phys.vy = Math.abs(phys.vy) * RESTITUTION
        } else if (maxY > vh) {
          phys.y = vh - sizePx - baseY - fy
          phys.vy = -Math.abs(phys.vy) * RESTITUTION
        }

        const c = centers[i]
        c.x = baseX + fx + phys.x + sizePx / 2
        c.y = baseY + fy + phys.y + sizePx / 2
        c.r = sizePx * 0.5
      }

      for (let i = 0; i < SHARDS.length; i += 1) {
        for (let j = i + 1; j < SHARDS.length; j += 1) {
          const a = centers[i]
          const b = centers[j]
          const dx = b.x - a.x
          const dy = b.y - a.y
          const minDist = a.r + b.r
          const d2 = dx * dx + dy * dy
          if (d2 >= minDist * minDist || d2 === 0) continue
          const dist = Math.sqrt(d2)
          const nx = dx / dist
          const ny = dy / dist
          const overlap = minDist - dist
          const m1 = mass(SHARDS[i].size)
          const m2 = mass(SHARDS[j].size)
          const inv = 1 / (m1 + m2)
          const pa = shardPhys[i]
          const pb = shardPhys[j]
          pa.x -= nx * overlap * (m2 * inv) * CORRECTION
          pa.y -= ny * overlap * (m2 * inv) * CORRECTION
          pb.x += nx * overlap * (m1 * inv) * CORRECTION
          pb.y += ny * overlap * (m1 * inv) * CORRECTION
          const rvx = pa.vx - pb.vx
          const rvy = pa.vy - pb.vy
          const relNormal = rvx * nx + rvy * ny
          if (relNormal < 0) {
            const impulse = (-(1 + COLLISION_E) * relNormal) / (1 / m1 + 1 / m2)
            pa.vx += (impulse / m1) * nx
            pa.vy += (impulse / m1) * ny
            pb.vx -= (impulse / m2) * nx
            pb.vy -= (impulse / m2) * ny
            pa.vx *= 0.5
            pa.vy *= 0.5
            pb.vx *= 0.5
            pb.vy *= 0.5
          }
        }
      }

      for (let i = 0; i < SHARDS.length; i += 1) {
        const el = shardRefs.current[i]
        if (!el) continue
        const s = SHARDS[i]
        const t = ((now / 1000) / s.period) * Math.PI * 2 + s.phase
        const fx = Math.sin(t) * s.ampX * vmin
        const fy = Math.cos(t) * s.ampY * vmin
        const phys = shardPhys[i]
        const rot = s.r + Math.sin(t * 0.7) * s.ampRot
        const z = s.z + Math.sin(t * 0.6) * s.zAmp
        el.style.transform = `translate3d(${fx + phys.x}px, ${fy + phys.y}px, ${z}px) rotateZ(${rot}deg)`
      }

      ripples = ripples.filter((rp) => rp.radius < rp.maxRadius)

      raf = requestAnimationFrame(compute)
    }

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX
      pointer.y = event.clientY
      pointer.active = true
    }
    const onPointerLeave = () => {
      pointer.active = false
    }
    const onPointerDown = (event: PointerEvent) => {
      const x = event.clientX
      const y = event.clientY
      ripples.push({
        x,
        y,
        radius: 24,
        maxRadius: Math.max(vw, vh) * 0.75,
        speed: 60,
        strength: 12,
      })
      if (ripples.length > 8) ripples.shift()
    }

    window.addEventListener('pointermove', onPointerMove)
    document.documentElement.addEventListener('pointerleave', onPointerLeave)
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('resize', remeasure)
    raf = requestAnimationFrame(compute)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onPointerMove)
      document.documentElement.removeEventListener('pointerleave', onPointerLeave)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('resize', remeasure)
    }
  }, [accent])

  return (
    <div className="bg3d" aria-hidden="true">
      {SHARDS.map((shard, i) => (
        <span
          key={`shard-${i}`}
          ref={(el) => {
            shardRefs.current[i] = el
          }}
          className="bg3d__shard"
          style={{
            left: `${shard.x}%`,
            top: `${shard.y}%`,
            width: `${shard.size}vmin`,
            height: `${shard.size}vmin`,
            opacity: shard.opacity,
            background: `linear-gradient(135deg, ${shard.from}, ${shard.to})`,
            clipPath: shard.clip,
          }}
        />
      ))}
    </div>
  )
}
