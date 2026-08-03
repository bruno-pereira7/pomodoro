export const REF_SIZE = 16
export const HOVER_ACC = 1.8
export const RESTITUTION = 0.9
export const COLLISION_E = 0.9
export const CORRECTION = 0.35
export const MAX_SPEED = 48
export const REPULSION = 340
export const REPULSION_FALLOFF = 0.14
export const FRAG_MIN_SIZE = 22
export const FRAG_COUNT = 5
export const MAX_PIECES = 130
export const DAMPING = 0.009
export const COALESCE_DELAY = 5000
export const MERGE_RADIUS = 18
export const FADE_OUT_MS = 650
export const HOME_SPEED = 3.4
export const HOME_GAIN = 0.06
export const HOME_EASE = 0.2

export const mass = (size: number) => (size / REF_SIZE) ** 2