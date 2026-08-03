import {
  COALESCE_DELAY,
  COLLISION_E,
  CORRECTION,
  DAMPING,
  FADE_OUT_MS,
  FRAG_COUNT,
  FRAG_MIN_SIZE,
  HOME_EASE,
  HOME_GAIN,
  HOME_SPEED,
  HOVER_ACC,
  mass,
  MAX_PIECES,
  MAX_SPEED,
  MERGE_RADIUS,
  REPULSION,
  REPULSION_FALLOFF,
  RESTITUTION,
} from './constants'
import { fragClip, outlinePoint, parseClip } from './geometry'
import type { Center, FragmentSnapshot, Obstacle, Piece } from './types'

export interface Metrics {
  vw: number
  vh: number
  vmin: number
}

export interface SimulationOptions {
  initial: Piece[]
  setId: () => number
  getElement: (id: number) => HTMLSpanElement | null
  getMetrics: () => Metrics
  setPieces: (next: Piece[]) => void
}

interface Pointer {
  x: number
  y: number
  active: boolean
}

export interface Simulation {
  start: () => void
  stop: () => void
  setPointer: (x: number, y: number) => void
  clearPointer: () => void
  explodeAt: (x: number, y: number) => void
}

export function createSimulation(options: SimulationOptions): Simulation {
  const { getElement, getMetrics, setPieces, setId } = options
  let pieces: Piece[] = options.initial
  let raf = 0
  let last = 0
  let lastClick = 0
  const pointer: Pointer = { x: 0, y: 0, active: false }

  const commit = (next: Piece[]) => {
    pieces = next
    setPieces(next)
  }

  const frame = () => {
    const now = performance.now()
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    const f = dt * 60
    const { vw, vh, vmin } = getMetrics()
    const list = pieces
    const n = list.length
    const centers = new Array<Center | undefined>(n)
    const interacting = now - lastClick <= COALESCE_DELAY

    for (let i = 0; i < n; i += 1) {
      const p = list[i]
      const el = getElement(p.id)
      if (!el) continue
      if (p.dying) continue
      const sizePx = p.size * vmin
      const m = mass(p.size)
      const baseX = (p.x / 100) * vw
      const baseY = (p.y / 100) * vh
      const t = (now / 1000 / p.period) * Math.PI * 2 + p.phase
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
      const el = getElement(p.id)
      if (!el) continue
      if (p.dying) continue
      const t = (now / 1000 / p.period) * Math.PI * 2 + p.phase
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

    const merged: Piece[] = []
    const obstacles: Obstacle[] = []
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
            id: setId(),
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
      commit(list.concat(merged))
    } else if (expired) {
      commit(list.filter((p) => !(p.dying && now - p.diedAt! >= FADE_OUT_MS)))
    }

    raf = requestAnimationFrame(frame)
  }

  const explode = (x: number, y: number) => {
    const now = performance.now()
    const { vw, vh, vmin } = getMetrics()
    const list = pieces
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
            id: setId(),
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

  return {
    start() {
      last = performance.now()
      raf = requestAnimationFrame(frame)
    },
    stop() {
      cancelAnimationFrame(raf)
    },
    setPointer(x, y) {
      pointer.x = x
      pointer.y = y
      pointer.active = true
    },
    clearPointer() {
      pointer.active = false
    },
    explodeAt(x, y) {
      lastClick = performance.now()
      explode(x, y)
    },
  }
}