import type { Point } from './types'

export function fragClip(): string {
  const count = 3 + (Math.random() < 0.5 ? 1 : 0)
  const pts: string[] = []
  for (let i = 0; i < count; i += 1) {
    pts.push(`${(6 + Math.random() * 88).toFixed(1)}% ${(6 + Math.random() * 88).toFixed(1)}%`)
  }
  return `polygon(${pts.join(', ')})`
}

export function parseClip(clip: string): Point[] {
  const body = clip.replace('polygon(', '').replace(/\)$/, '')
  return body.split(',').map((pair) => {
    const [x, y] = pair.trim().split(/\s+/)
    return { x: parseFloat(x), y: parseFloat(y) }
  })
}

export function outlinePoint(verts: Point[], q: number): Point {
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