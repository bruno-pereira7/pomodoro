export interface Point {
  x: number
  y: number
}

export interface Shard {
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

export interface FragmentSnapshot {
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
  outline: Point[]
}

export interface Piece extends Shard {
  id: number
  child: boolean
  px: number
  py: number
  vx: number
  vy: number
  lastKick: number
  group?: number
  origin?: Point
  parent?: FragmentSnapshot
  outlineIndex?: number
  entering?: boolean
  dying?: boolean
  diedAt?: number
}

export interface Center {
  x: number
  y: number
  r: number
}

export interface Obstacle {
  x: number
  y: number
  r: number
  group: number
}