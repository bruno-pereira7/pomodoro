import type { Piece, Shard } from './types'

export const SHARDS: Shard[] = [
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

export const INITIAL_PIECE_COUNT = SHARDS.length

export function toPieces(): Piece[] {
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