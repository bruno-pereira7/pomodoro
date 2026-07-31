import {
  DEFAULT_SETTINGS,
  timerReducer,
  type CompletedSession,
  type SessionType,
  type Settings,
  type TimerState,
  type TimerStatus,
} from './timer'

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

const SETTINGS_KEY = 'pomodoro.settings.v1'
const TIMER_KEY = 'pomodoro.timer.v1'
const HISTORY_KEY = 'pomodoro.history.v1'

export const MAX_HISTORY_ENTRIES = 200

export interface PersistedTimerState {
  type: SessionType
  status: TimerStatus
  remainingSeconds: number
  totalSeconds: number
  cyclesCompleted: number
  endAt: number | null
}

export interface HistoryEntry {
  id: string
  date: string
  type: SessionType
  durationSeconds: number
  cyclesCompleted: number
}

function positiveInt(value: unknown, fallback: number, min = 1, max = 999): number {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, Math.round(n)))
}

export function normalizeSettings(raw: unknown): Settings {
  const source = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  return {
    focusMinutes: positiveInt(source.focusMinutes, DEFAULT_SETTINGS.focusMinutes),
    shortBreakMinutes: positiveInt(
      source.shortBreakMinutes,
      DEFAULT_SETTINGS.shortBreakMinutes,
    ),
    longBreakMinutes: positiveInt(source.longBreakMinutes, DEFAULT_SETTINGS.longBreakMinutes),
    longBreakInterval: positiveInt(
      source.longBreakInterval,
      DEFAULT_SETTINGS.longBreakInterval,
    ),
  }
}

function parse<T>(storage: StorageLike, key: string, fallback: T | null): T | null {
  const raw = storage.getItem(key)
  if (raw === null) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function loadSettings(storage: StorageLike): Settings {
  return normalizeSettings(parse<Settings>(storage, SETTINGS_KEY, null))
}

export function saveSettings(storage: StorageLike, settings: Settings): void {
  storage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

const SESSION_TYPES: readonly SessionType[] = ['focus', 'shortBreak', 'longBreak']
const TIMER_STATUSES: readonly TimerStatus[] = ['idle', 'running', 'paused']

function normalizePersistedTimer(raw: unknown): PersistedTimerState | null {
  if (!raw || typeof raw !== 'object') return null
  const source = raw as Record<string, unknown>
  if (
    !SESSION_TYPES.includes(source.type as SessionType) ||
    !TIMER_STATUSES.includes(source.status as TimerStatus) ||
    typeof source.remainingSeconds !== 'number' ||
    typeof source.totalSeconds !== 'number' ||
    typeof source.cyclesCompleted !== 'number'
  ) {
    return null
  }
  const endAt =
    source.endAt === null || typeof source.endAt === 'number' ? (source.endAt as number | null) : null
  return {
    type: source.type as SessionType,
    status: source.status as TimerStatus,
    remainingSeconds: source.remainingSeconds,
    totalSeconds: source.totalSeconds,
    cyclesCompleted: source.cyclesCompleted,
    endAt,
  }
}

export function loadPersistedTimer(storage: StorageLike): PersistedTimerState | null {
  return normalizePersistedTimer(parse<unknown>(storage, TIMER_KEY, null))
}

export function saveTimer(storage: StorageLike, state: PersistedTimerState): void {
  storage.setItem(TIMER_KEY, JSON.stringify(state))
}

export function rehydrateTimerState(
  persisted: PersistedTimerState,
  settings: Settings,
  now: number,
): { state: TimerState; sessionCompleted: boolean } {
  const base: TimerState = {
    settings,
    type: persisted.type,
    status: persisted.status,
    remainingSeconds: persisted.remainingSeconds,
    totalSeconds: persisted.totalSeconds,
    cyclesCompleted: persisted.cyclesCompleted,
    endAt: persisted.endAt,
    completedSession: null,
  }

  if (persisted.status === 'running' && persisted.endAt !== null) {
    const remaining = Math.max(0, Math.ceil((persisted.endAt - now) / 1000))
    if (remaining > 0) {
      return { state: { ...base, remainingSeconds: remaining }, sessionCompleted: false }
    }
    const next = timerReducer(base, { type: 'tick', now })
    return { state: next, sessionCompleted: next.completedSession !== null }
  }

  return { state: { ...base, endAt: null }, sessionCompleted: false }
}

let idCounter = 0

export function createHistoryEntry(session: CompletedSession, now: number): HistoryEntry {
  idCounter += 1
  return {
    id: `${now}-${idCounter}`,
    date: new Date(now).toISOString(),
    type: session.type,
    durationSeconds: session.durationSeconds,
    cyclesCompleted: session.cyclesCompleted,
  }
}

function normalizeHistory(raw: unknown): HistoryEntry[] | null {
  if (!Array.isArray(raw)) return null
  const entries: HistoryEntry[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const source = item as Record<string, unknown>
    if (
      typeof source.id !== 'string' ||
      typeof source.date !== 'string' ||
      !SESSION_TYPES.includes(source.type as SessionType) ||
      typeof source.durationSeconds !== 'number' ||
      typeof source.cyclesCompleted !== 'number'
    ) {
      continue
    }
    entries.push({
      id: source.id,
      date: source.date,
      type: source.type as SessionType,
      durationSeconds: source.durationSeconds,
      cyclesCompleted: source.cyclesCompleted,
    })
  }
  return entries
}

export function loadHistory(storage: StorageLike): HistoryEntry[] {
  return normalizeHistory(parse<unknown>(storage, HISTORY_KEY, null)) ?? []
}

export function addHistoryEntry(storage: StorageLike, entry: HistoryEntry): HistoryEntry[] {
  const entries = [entry, ...loadHistory(storage)].slice(0, MAX_HISTORY_ENTRIES)
  storage.setItem(HISTORY_KEY, JSON.stringify(entries))
  return entries
}

export function clearHistory(storage: StorageLike): void {
  storage.setItem(HISTORY_KEY, JSON.stringify([]))
}
