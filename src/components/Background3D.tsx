import { useEffect, useRef, useState } from 'react'

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

interface FragmentSnapshot {
  size: number
  r: number
  z: number
  zAmp: number
  ampX: number
  ampY: number
  ampRot: number
  period: number
  phase: number
  opacity: number
  from: string
  to: string
  clip: string
  outline: { x: number; y: number }[]
}

interface Piece extends Shard {
  id: number
  child: boolean
  px: number
  py: number
  vx: number
  vy: number
  lastKick: number
  group?: number
  origin?: { x: number; y: number }
  parent?: FragmentSnapshot
  outlineIndex?: number
  entering?: boolean
  dying?: boolean
  diedAt?: number
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

const REF_SIZE = 16
const HOVER_ACC = 1.8
const RESTITUTION = 0.9
const COLLISION_E = 0.9
const CORRECTION = 0.35
const MAX_SPEED = 48
const REPULSION = 340
const REPULSION_FALLOFF = 0.14
const FRAG_MIN_SIZE = 22
const FRAG_COUNT = 5
const MAX_PIECES = 130
const DAMPING = 0.009
const COALESCE_DELAY = 5000
const MERGE_RADIUS = 18
const FADE_OUT_MS = 650
const HOME_SPEED = 3.4
const HOME_GAIN = 0.06
const HOME_EASE = 0.2

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

const mass = (size: number) => (size / REF_SIZE) ** 2

function fragClip(): string {
  const count = 3 + (Math.random() < 0.5 ? 1 : 0)
  const pts: string[] = []
  for (let i = 0; i < count; i += 1) {
    pts.push(`${(6 + Math.random() * 88).toFixed(1)}% ${(6 + Math.random() * 88).toFixed(1)}%`)
  }
  return `polygon(${pts.join(', ')})`
}

function parseClip(clip: string): { x: number; y: number }[] {
  const body = clip.replace('polygon(', '').replace(/\)$/, '')
  return body.split(',').map((pair) => {
    const [x, y] = pair.trim().split(/\s+/)
    return { x: parseFloat(x), y: parseFloat(y) }
  })
}

function outlinePoint(verts: { x: number; y: number }[], q: number): { x: number; y: number } {
  const n = verts.length
  if (n === 0) return { x: 50, y: 50 }
  if (n === 1) return verts[0]
  let perim = 0
  for (let i = 0; i < n; i += 1) {
    const a = verts[i]
    const b = verts[(i + 1) % n]
    perim += Math.hypot(b.x - a.x, b.y - a.y)
  }
  const target = Math.min(1, Math.max(0, q)) * perim
  let acc = 0
  for (let i = 0; i < n; i += 1) {
    const a = verts[i]
    const b = verts[(i + 1) % n]
    const len = Math.hypot(b.x - a.x, b.y - a.y)
    if (i === n - 1 || acc + len >= target) {
      const t = len === 0 ? 0 : (target - acc) / len
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
    }
    acc += len
  }
  return verts[0]
}

function toPieces(): Piece[] {
  return SHARDS.map((shard, id) => ({
    ...shard,
    id,
    child: false,
    px: 0,
    py: 0,
    vx: 0,
    vy: 0,
    lastKick: 0,
  }))
}

export function Background3D({ accent }: { accent: string }) {
  const [pieces, setPieces] = useState<Piece[]>(toPieces)
  const simRef = useRef<Piece[]>(pieces)
  const elRefs = useRef(new Map<number, HTMLSpanElement>())
  const nextId = useRef(SHARDS.length)

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

    const commit = (next: Piece[]) => {
      simRef.current = next
      setPieces(next)
    }

    const pointer = { x: 0, y: 0, active: false }
    let lastClick = 0
    let last = performance.now()
    let raf = 0

    const compute = () => {
      const now = performance.now()
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const f = dt * 60
      const list = simRef.current
      const n = list.length
      const centers = new Array<{ x: number; y: number; r: number }>(n)
      const interacting = now - lastClick <= COALESCE_DELAY

      for (let i = 0; i < n; i += 1) {
        const p = list[i]
        const el = elRefs.current.get(p.id)
        if (!el) continue
        if (p.dying) continue
        const sizePx = p.size * vmin
        const m = mass(p.size)
        const baseX = (p.x / 100) * vw
        const baseY = (p.y / 100) * vh
        const t = ((now / 1000) / p.period) * Math.PI * 2 + p.phase
        const fx = Math.sin(t) * p.ampX * vmin
        const fy = Math.cos(t) * p.ampY * vmin
        const cx = baseX + fx + p.px + sizePx / 2
        const cy = baseY + fy + p.py + sizePx / 2

        if (pointer.active && interacting) {
          const dx = cx - pointer.x
          const dy = cy - pointer.y
          const d2 = dx * dx + dy * dy
          const radius = Math.max(180, sizePx * 1.5)
          if (d2 < radius * radius && d2 > 0) {
            const dist = Math.sqrt(d2)
            const force = 1 - dist / radius
            p.vx += ((dx / dist) * HOVER_ACC * force) / m * f
            p.vy += ((dy / dist) * HOVER_ACC * force) / m * f
            p.lastKick = now
          }
        }

        p.px += p.vx * f
        p.py += p.vy * f

        const damp = Math.max(0, 1 - DAMPING * f)
        p.vx *= damp
        p.vy *= damp

        const speed2 = p.vx * p.vx + p.vy * p.vy
        if (speed2 > MAX_SPEED * MAX_SPEED) {
          const speed = Math.sqrt(speed2)
          p.vx *= MAX_SPEED / speed
          p.vy *= MAX_SPEED / speed
        }

        const minX = baseX + fx + p.px
        const maxX = minX + sizePx
        const minY = baseY + fy + p.py
        const maxY = minY + sizePx
        if (minX < 0) {
          p.px = -baseX - fx
          p.vx = Math.abs(p.vx) * RESTITUTION
        } else if (maxX > vw) {
          p.px = vw - sizePx - baseX - fx
          p.vx = -Math.abs(p.vx) * RESTITUTION
        }
        if (minY < 0) {
          p.py = -baseY - fy
          p.vy = Math.abs(p.vy) * RESTITUTION
        } else if (maxY > vh) {
          p.py = vh - sizePx - baseY - fy
          p.vy = -Math.abs(p.vy) * RESTITUTION
        }

        centers[i] = { x: cx, y: cy, r: sizePx * 0.5 }
      }

      for (let i = 0; i < n; i += 1) {
        const a = centers[i]
        if (!a) continue
        for (let j = i + 1; j < n; j += 1) {
          const b = centers[j]
          if (!b) continue
          const dx = b.x - a.x
          const dy = b.y - a.y
          const minDist = a.r + b.r
          const d2 = dx * dx + dy * dy
          if (d2 >= minDist * minDist || d2 === 0) continue
          const dist = Math.sqrt(d2)
          const nx = dx / dist
          const ny = dy / dist
          const overlap = minDist - dist
          const m1 = mass(list[i].size)
          const m2 = mass(list[j].size)
          const inv = 1 / (m1 + m2)
          const pa = list[i]
          const pb = list[j]
          pa.px -= nx * overlap * (m2 * inv) * CORRECTION
          pa.py -= ny * overlap * (m2 * inv) * CORRECTION
          pb.px += nx * overlap * (m1 * inv) * CORRECTION
          pb.py += ny * overlap * (m1 * inv) * CORRECTION
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
            pa.lastKick = now
            pb.lastKick = now
          }
        }
      }

      for (let i = 0; i < n; i += 1) {
        const p = list[i]
        const el = elRefs.current.get(p.id)
        if (!el) continue
        if (p.dying) continue
        const t = ((now / 1000) / p.period) * Math.PI * 2 + p.phase
        const fx = Math.sin(t) * p.ampX * vmin
        const fy = Math.cos(t) * p.ampY * vmin
        const rot = p.r + Math.sin(t * 0.7) * p.ampRot
        const z = p.z + Math.sin(t * 0.6) * p.zAmp
        el.style.transform = `translate3d(${fx + p.px}px, ${fy + p.py}px, ${z}px) rotateZ(${rot}deg)`
      }

      const idle = !interacting
      const groups = new Map<number, Piece[]>()
      for (const p of list) {
        if (p.group === undefined || p.dying) continue
        const members = groups.get(p.group) ?? []
        members.push(p)
        groups.set(p.group, members)
      }

      const mergeIds = new Set<number>()
      const merged: Piece[] = []
      const obstacles: { x: number; y: number; r: number; group: number }[] = []
      if (idle) {
        for (const g of groups.values()) {
          if (g.length === 0) continue
          const pd = g[0].parent!
          const sizePx = pd.size * vmin
          const boxLeft = (g[0].origin!.x / 100) * vw
          const boxTop = (g[0].origin!.y / 100) * vh
          obstacles.push({ x: boxLeft + sizePx / 2, y: boxTop + sizePx / 2, r: sizePx * 0.5, group: g[0].group! })
          let allClose = true
          for (const p of g) {
            const fSizePx = p.size * vmin
            const cx = (p.x / 100) * vw + p.px + fSizePx / 2
            const cy = (p.y / 100) * vh + p.py + fSizePx / 2
            const pt = outlinePoint(pd.outline, (p.outlineIndex! + 0.5) / FRAG_COUNT)
            const txRaw = boxLeft + (pt.x / 100) * sizePx
            const tyRaw = boxTop + (pt.y / 100) * sizePx
            const margin = Math.max(fSizePx, MERGE_RADIUS * 2)
            const tx = Math.min(vw - margin, Math.max(margin, txRaw))
            const ty = Math.min(vh - margin, Math.max(margin, tyRaw))
            const dx = tx - cx
            const dy = ty - cy
            const dist = Math.hypot(dx, dy)
            if (dist > MERGE_RADIUS) allClose = false
            if (dist > 0.001) {
              const targetSpeed = Math.min(HOME_SPEED, dist * HOME_GAIN)
              p.vx += ((dx / dist) * targetSpeed - p.vx) * HOME_EASE * f
              p.vy += ((dy / dist) * targetSpeed - p.vy) * HOME_EASE * f
            } else {
              p.vx *= 0.9
              p.vy *= 0.9
            }
          }
          if (allClose) {
            const first = g[0]
            merged.push({
              id: nextId.current++,
              child: false,
              entering: true,
              x: first.origin!.x,
              y: first.origin!.y,
              size: pd.size,
              ampX: pd.ampX,
              ampY: pd.ampY,
              z: pd.z,
              zAmp: pd.zAmp,
              r: pd.r,
              ampRot: pd.ampRot,
              period: pd.period,
              phase: pd.phase,
              opacity: pd.opacity,
              from: pd.from,
              to: pd.to,
              clip: pd.clip,
              px: 0,
              py: 0,
              vx: 0,
              vy: 0,
              lastKick: now,
            })
            for (const m of g) {
              m.dying = true
              m.diedAt = now
              m.vx = 0
              m.vy = 0
            }
          }
        }
      }

      if (obstacles.length > 0) {
        for (let i = 0; i < n; i += 1) {
          const p = list[i]
          if (p.dying) continue
          const fSizePx = p.size * vmin
          const cxp = (p.x / 100) * vw + p.px + fSizePx / 2
          const cyp = (p.y / 100) * vh + p.py + fSizePx / 2
          for (const ob of obstacles) {
            if (p.group === ob.group) continue
            const dx = cxp - ob.x
            const dy = cyp - ob.y
            const minDist = ob.r + fSizePx * 0.5
            const d2 = dx * dx + dy * dy
            if (d2 >= minDist * minDist || d2 === 0) continue
            const dist = Math.sqrt(d2)
            const nx = dx / dist
            const ny = dy / dist
            const overlap = minDist - dist
            p.px += nx * overlap * CORRECTION
            p.py += ny * overlap * CORRECTION
            const rel = p.vx * nx + p.vy * ny
            if (rel < 0) {
              p.vx -= rel * nx
              p.vy -= rel * ny
            }
          }
        }
      }

      let expired = false
      for (const p of list) {
        if (p.dying && now - p.diedAt! >= FADE_OUT_MS) {
          expired = true
          break
        }
      }

      if (merged.length > 0) {
        commit(list.filter((p) => !mergeIds.has(p.id)).concat(merged))
      } else if (expired) {
        commit(list.filter((p) => !(p.dying && now - p.diedAt! >= FADE_OUT_MS)))
      }

      raf = requestAnimationFrame(compute)
    }

    const explode = (x: number, y: number) => {
      const now = performance.now()
      const list = simRef.current
      const r0 = vw * REPULSION_FALLOFF
      const spawns: Piece[] = []
      const removeIds = new Set<number>()

      for (const p of list) {
        const sizePx = p.size * vmin
        const baseX = (p.x / 100) * vw
        const baseY = (p.y / 100) * vh
        const cx = baseX + p.px + sizePx / 2
        const cy = baseY + p.py + sizePx / 2
        let dx = cx - x
        let dy = cy - y
        let dist = Math.hypot(dx, dy)
        if (dist < 0.001) {
          dx = 1
          dy = 0
          dist = 1
        }

        const fall = 1 / (1 + dist / r0)
        const kick = REPULSION * fall
        const m = mass(p.size)

        const canFrag = !p.child && p.size >= FRAG_MIN_SIZE && dist < sizePx
        if (canFrag && list.length + spawns.length < MAX_PIECES) {
          removeIds.add(p.id)
          const boost = Math.max(34, kick * 0.24)
          const origin = { x: p.x, y: p.y }
          const outline = parseClip(p.clip)
          const parent: FragmentSnapshot = {
            size: p.size,
            r: p.r,
            z: p.z,
            zAmp: p.zAmp,
            ampX: p.ampX,
            ampY: p.ampY,
            ampRot: p.ampRot,
            period: p.period,
            phase: p.phase,
            opacity: p.opacity,
            from: p.from,
            to: p.to,
            clip: p.clip,
            outline,
          }
          for (let k = 0; k < FRAG_COUNT; k += 1) {
            const ang = (k / FRAG_COUNT) * Math.PI * 2 + Math.random() * 0.8
            spawns.push({
              id: nextId.current++,
              child: true,
              group: p.id,
              origin,
              parent,
              outlineIndex: k,
              x: (cx / vw) * 100,
              y: (cy / vh) * 100,
              size: p.size * (0.16 + Math.random() * 0.16),
              ampX: (Math.random() * 2 - 1) * 3,
              ampY: (Math.random() * 2 - 1) * 3,
              z: p.z + (Math.random() * 50 - 25),
              zAmp: Math.random() * 10,
              r: p.r + (Math.random() * 60 - 30),
              ampRot: p.ampRot * (0.5 + Math.random()),
              period: p.period + Math.random() * 7,
              phase: Math.random() * Math.PI * 2,
              opacity: p.opacity * (0.75 + Math.random() * 0.25),
              from: p.from,
              to: p.to,
              clip: fragClip(),
              px: p.px,
              py: p.py,
              vx: p.vx + Math.cos(ang) * boost + (Math.random() * 2 - 1) * 8,
              vy: p.vy + Math.sin(ang) * boost + (Math.random() * 2 - 1) * 8,
              lastKick: now,
            })
          }
          continue
        }

        p.vx += (dx / dist) * (kick / m)
        p.vy += (dy / dist) * (kick / m)
        p.lastKick = now
      }

      if (spawns.length === 0 && removeIds.size === 0) return
      commit(list.filter((p) => !removeIds.has(p.id)).concat(spawns))
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
      lastClick = performance.now()
      explode(event.clientX, event.clientY)
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
      {pieces.map((piece) => (
        <span
          key={piece.id}
          ref={(el) => {
            if (el) elRefs.current.set(piece.id, el)
            else elRefs.current.delete(piece.id)
          }}
          className={`bg3d__shard${piece.entering ? ' bg3d__shard--in' : ''}${
            piece.dying ? ' bg3d__shard--out' : ''
          }`}
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            width: `${piece.size}vmin`,
            height: `${piece.size}vmin`,
            opacity: 'var(--piece-opacity)',
            ['--piece-opacity' as string]: piece.opacity,
            background: `linear-gradient(135deg, ${piece.from}, ${piece.to})`,
            clipPath: piece.clip,
          }}
        />
      ))}
    </div>
  )
}
