import { useEffect, useRef, useState } from 'react'
import { INITIAL_PIECE_COUNT, toPieces } from '../background/shards'
import { createSimulation, type Simulation } from '../background/simulation'
import type { Piece } from '../background/types'

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export function Background3D() {
  const [pieces, setPieces] = useState<Piece[]>(toPieces)
  const elRefs = useRef(new Map<number, HTMLSpanElement>())
  const nextId = useRef(INITIAL_PIECE_COUNT)
  const piecesRef = useRef(pieces)
  piecesRef.current = pieces

  useEffect(() => {
    if (import.meta.env.VITEST) return
    if (prefersReducedMotion()) return

    let vw = window.innerWidth
    let vh = window.innerHeight
    let vmin = Math.min(vw, vh) / 100

    const sim: Simulation = createSimulation({
      initial: piecesRef.current,
      setId: () => nextId.current++,
      getElement: (id) => elRefs.current.get(id) ?? null,
      getMetrics: () => ({ vw, vh, vmin }),
      setPieces,
    })

    const remeasure = () => {
      vw = window.innerWidth
      vh = window.innerHeight
      vmin = Math.min(vw, vh) / 100
    }
    const onPointerMove = (event: PointerEvent) => {
      sim.setPointer(event.clientX, event.clientY)
    }
    const onPointerLeave = () => {
      sim.clearPointer()
    }
    const onPointerDown = (event: PointerEvent) => {
      sim.explodeAt(event.clientX, event.clientY)
    }

    window.addEventListener('pointermove', onPointerMove)
    document.documentElement.addEventListener('pointerleave', onPointerLeave)
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('resize', remeasure)
    sim.start()

    return () => {
      sim.stop()
      window.removeEventListener('pointermove', onPointerMove)
      document.documentElement.removeEventListener('pointerleave', onPointerLeave)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('resize', remeasure)
    }
  }, [])

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