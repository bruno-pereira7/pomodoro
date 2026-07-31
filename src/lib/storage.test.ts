import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SETTINGS,
  createTimerState,
  timerReducer,
  type CompletedSession,
  type Settings,
} from './timer'
import {
  addHistoryEntry,
  createHistoryEntry,
  loadHistory,
  loadPersistedTimer,
  loadSettings,
  normalizeSettings,
  rehydrateTimerState,
  saveSettings,
  saveTimer,
  type PersistedTimerState,
  type StorageLike,
} from './storage'

const T0 = 1_000_000_000

function createMemoryStorage(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>()
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value)
    },
  }
}

describe('normalizeSettings', () => {
  it('returns defaults for empty input', () => {
    expect(normalizeSettings(null)).toEqual(DEFAULT_SETTINGS)
    expect(normalizeSettings({})).toEqual(DEFAULT_SETTINGS)
  })

  it('coerces numbers and clamps to valid range', () => {
    expect(normalizeSettings({ focusMinutes: 30 })).toEqual({
      ...DEFAULT_SETTINGS,
      focusMinutes: 30,
    })
    expect(normalizeSettings({ focusMinutes: 0, shortBreakMinutes: -5 })).toEqual({
      ...DEFAULT_SETTINGS,
      focusMinutes: 1,
      shortBreakMinutes: 1,
    })
    expect(normalizeSettings({ focusMinutes: '40' })).toEqual({
      ...DEFAULT_SETTINGS,
      focusMinutes: 40,
    })
  })

  it('falls back to defaults for invalid values', () => {
    expect(normalizeSettings({ focusMinutes: 'abc' }).focusMinutes).toBe(
      DEFAULT_SETTINGS.focusMinutes,
    )
  })
})

describe('settings persistence', () => {
  it('round-trips settings through storage', () => {
    const storage = createMemoryStorage()
    const custom: Settings = {
      focusMinutes: 50,
      shortBreakMinutes: 10,
      longBreakMinutes: 20,
      longBreakInterval: 6,
    }
    saveSettings(storage, custom)
    expect(loadSettings(storage)).toEqual(custom)
  })

  it('falls back to defaults on corrupt data', () => {
    const storage = createMemoryStorage()
    storage.setItem('pomodoro.settings.v1', '{not json')
    expect(loadSettings(storage)).toEqual(DEFAULT_SETTINGS)
  })

  it('falls back to defaults when nothing is stored', () => {
    expect(loadSettings(createMemoryStorage())).toEqual(DEFAULT_SETTINGS)
  })
})

describe('timer persistence and rehydration', () => {
  it('round-trips the persisted timer shape', () => {
    const storage = createMemoryStorage()
    const state = timerReducer(createTimerState(DEFAULT_SETTINGS), {
      type: 'start',
      now: T0,
    })
    saveTimer(storage, state)
    const loaded = loadPersistedTimer(storage)
    expect(loaded).toEqual({
      type: 'focus',
      status: 'running',
      remainingSeconds: 1500,
      totalSeconds: 1500,
      cyclesCompleted: 0,
      endAt: T0 + 1500_000,
    })
  })

  it('recomputes remaining seconds from endAt while running', () => {
    const persisted: PersistedTimerState = {
      type: 'focus',
      status: 'running',
      remainingSeconds: 1500,
      totalSeconds: 1500,
      cyclesCompleted: 0,
      endAt: T0 + 1500_000,
    }
    const { state, sessionCompleted } = rehydrateTimerState(
      persisted,
      DEFAULT_SETTINGS,
      T0 + 60_000,
    )
    expect(state.status).toBe('running')
    expect(state.remainingSeconds).toBe(1440)
    expect(state.endAt).toBe(T0 + 1500_000)
    expect(sessionCompleted).toBe(false)
  })

  it('marks a session completed when it finished while away', () => {
    const persisted: PersistedTimerState = {
      type: 'focus',
      status: 'running',
      remainingSeconds: 1500,
      totalSeconds: 1500,
      cyclesCompleted: 0,
      endAt: T0 + 1500_000,
    }
    const { state, sessionCompleted } = rehydrateTimerState(
      persisted,
      DEFAULT_SETTINGS,
      T0 + 2000_000,
    )
    expect(sessionCompleted).toBe(true)
    expect(state.type).toBe('shortBreak')
    expect(state.status).toBe('idle')
    expect(state.cyclesCompleted).toBe(1)
    expect(state.completedSession).toEqual({
      type: 'focus',
      cyclesCompleted: 1,
      durationSeconds: 1500,
    })
  })

  it('rejects invalid persisted timer data', () => {
    const storage = createMemoryStorage()
    storage.setItem('pomodoro.timer.v1', JSON.stringify({ garbage: true }))
    expect(loadPersistedTimer(storage)).toBeNull()
  })
})

describe('history', () => {
  it('creates a history entry from a completed session', () => {
    const session: CompletedSession = { type: 'focus', cyclesCompleted: 3, durationSeconds: 1500 }
    const entry = createHistoryEntry(session, T0)
    expect(entry.type).toBe('focus')
    expect(entry.durationSeconds).toBe(1500)
    expect(entry.cyclesCompleted).toBe(3)
    expect(entry.date).toBe(new Date(T0).toISOString())
  })

  it('adds entries newest-first and persists them', () => {
    const storage = createMemoryStorage()
    const first = createHistoryEntry({ type: 'focus', cyclesCompleted: 1, durationSeconds: 1500 }, T0)
    const second = createHistoryEntry(
      { type: 'shortBreak', cyclesCompleted: 1, durationSeconds: 300 },
      T0 + 1,
    )
    addHistoryEntry(storage, first)
    addHistoryEntry(storage, second)
    const history = loadHistory(storage)
    expect(history.map((e) => e.type)).toEqual(['shortBreak', 'focus'])
  })

  it('caps the number of entries', () => {
    const storage = createMemoryStorage()
    for (let i = 0; i < 205; i += 1) {
      addHistoryEntry(
        storage,
        createHistoryEntry({ type: 'focus', cyclesCompleted: 1, durationSeconds: 1500 }, T0 + i),
      )
    }
    expect(loadHistory(storage)).toHaveLength(200)
  })

  it('returns an empty list on corrupt data', () => {
    const storage = createMemoryStorage()
    storage.setItem('pomodoro.history.v1', 'nope')
    expect(loadHistory(storage)).toEqual([])
  })

  it('drops malformed entries during normalization', () => {
    const storage = createMemoryStorage()
    storage.setItem(
      'pomodoro.history.v1',
      JSON.stringify([
        { id: 'a', date: 'x', type: 'focus', durationSeconds: 1500, cyclesCompleted: 1 },
        { bad: 'entry' },
      ]),
    )
    expect(loadHistory(storage)).toHaveLength(1)
  })
})

describe('rehydrateTimerState keeps settings', () => {
  it('uses the passed settings for the reconstructed state', () => {
    const custom: Settings = { ...DEFAULT_SETTINGS, focusMinutes: 40 }
    const persisted: PersistedTimerState = {
      type: 'focus',
      status: 'idle',
      remainingSeconds: 1500,
      totalSeconds: 1500,
      cyclesCompleted: 0,
      endAt: null,
    }
    const { state } = rehydrateTimerState(persisted, custom, T0)
    expect(state.settings).toEqual(custom)
  })
})
