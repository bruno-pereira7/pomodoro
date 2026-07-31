import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { usePomodoro } from './usePomodoro'
import {
  DEFAULT_SETTINGS,
  sessionLabel,
  type CompletedSession,
  type Settings,
} from '../lib/timer'
import { saveSettings, saveTimer, type StorageLike } from '../lib/storage'

const T0 = 1_000_000_000

function createMemoryStorage(): StorageLike {
  const data = new Map<string, string>()
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value)
    },
  }
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(T0)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('usePomodoro', () => {
  it('starts with defaults when nothing is stored', () => {
    const { result } = renderHook(() => usePomodoro(createMemoryStorage()))
    expect(result.current.state.type).toBe('focus')
    expect(result.current.state.status).toBe('idle')
    expect(result.current.state.remainingSeconds).toBe(1500)
  })

  it('starts, ticks and pauses based on wall clock', () => {
    const { result } = renderHook(() => usePomodoro(createMemoryStorage()))
    act(() => result.current.start())
    expect(result.current.state.status).toBe('running')

    act(() => vi.advanceTimersByTime(90_000))
    expect(result.current.state.remainingSeconds).toBe(1410)

    act(() => result.current.pause())
    expect(result.current.state.status).toBe('paused')

    act(() => vi.advanceTimersByTime(30_000))
    expect(result.current.state.remainingSeconds).toBe(1410)
  })

  it('resumes from where it stopped', () => {
    const { result } = renderHook(() => usePomodoro(createMemoryStorage()))
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(90_000))
    act(() => result.current.pause())
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(60_000))
    expect(result.current.state.remainingSeconds).toBe(1350)
  })

  it('completes a focus session and reports it once', () => {
    const completed: CompletedSession[] = []
    const { result } = renderHook(() =>
      usePomodoro(createMemoryStorage(), { onSessionComplete: (s) => completed.push(s) }),
    )
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(1500_000))
    expect(result.current.state.type).toBe('shortBreak')
    expect(result.current.state.cyclesCompleted).toBe(1)
    expect(result.current.state.status).toBe('idle')
    expect(completed).toEqual([
      { type: 'focus', cyclesCompleted: 1, durationSeconds: 1500 },
    ])
  })

  it('completes a focus only once despite repeated ticks', () => {
    const completed: CompletedSession[] = []
    const { result } = renderHook(() =>
      usePomodoro(createMemoryStorage(), { onSessionComplete: (s) => completed.push(s) }),
    )
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(1500_000))
    act(() => vi.advanceTimersByTime(5000))
    expect(completed).toHaveLength(1)
  })

  it('reaches a long break after the configured interval', () => {
    const settings: Settings = { ...DEFAULT_SETTINGS, longBreakInterval: 2 }
    const storage = createMemoryStorage()
    saveSettings(storage, settings)
    const { result } = renderHook(() => usePomodoro(storage))
    for (let i = 0; i < 2; i += 1) {
      act(() => result.current.start())
      act(() => vi.advanceTimersByTime(1500_000))
      act(() => result.current.start())
      act(() => vi.advanceTimersByTime(300_000))
    }
    expect(result.current.state.cyclesCompleted).toBe(2)
    expect(result.current.state.type).toBe('longBreak')
  })

  it('restores a running session on mount, accounting for elapsed time', () => {
    const storage = createMemoryStorage()
    saveTimer(storage, {
      type: 'focus',
      status: 'running',
      remainingSeconds: 1500,
      totalSeconds: 1500,
      cyclesCompleted: 0,
      endAt: T0 + 1500_000,
    })
    vi.setSystemTime(T0 + 120_000)
    const { result } = renderHook(() => usePomodoro(storage))
    expect(result.current.state.status).toBe('running')
    expect(result.current.state.remainingSeconds).toBe(1380)
  })

  it('records a completed session that finished while away', () => {
    const storage = createMemoryStorage()
    saveTimer(storage, {
      type: 'focus',
      status: 'running',
      remainingSeconds: 1500,
      totalSeconds: 1500,
      cyclesCompleted: 0,
      endAt: T0 + 1500_000,
    })
    const completed: CompletedSession[] = []
    vi.setSystemTime(T0 + 2000_000)
    const { result } = renderHook(() =>
      usePomodoro(storage, { onSessionComplete: (s) => completed.push(s) }),
    )
    expect(completed).toEqual([
      { type: 'focus', cyclesCompleted: 1, durationSeconds: 1500 },
    ])
    expect(result.current.state.type).toBe('shortBreak')
  })

  it('persists settings and state on update', () => {
    const storage = createMemoryStorage()
    const { result } = renderHook(() => usePomodoro(storage))
    const custom: Settings = { ...DEFAULT_SETTINGS, focusMinutes: 40 }
    act(() => result.current.updateSettings(custom))
    expect(result.current.state.settings).toEqual(custom)
    expect(result.current.state.remainingSeconds).toBe(2400)
  })

  it('ignores notification when no callback is provided', () => {
    const { result } = renderHook(() => usePomodoro(createMemoryStorage()))
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(1500_000))
    expect(result.current.state.type).toBe('shortBreak')
  })

  it('selects a session type manually', () => {
    const { result } = renderHook(() => usePomodoro(createMemoryStorage()))
    act(() => result.current.selectType('longBreak'))
    expect(result.current.state.type).toBe('longBreak')
    expect(result.current.state.remainingSeconds).toBe(900)
  })

  it('resets the current session', () => {
    const { result } = renderHook(() => usePomodoro(createMemoryStorage()))
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(60_000))
    act(() => result.current.reset())
    expect(result.current.state.status).toBe('idle')
    expect(result.current.state.remainingSeconds).toBe(1500)
  })
})

describe('sessionLabel', () => {
  it('maps session types to readable labels', () => {
    expect(sessionLabel('focus')).toBe('Foco')
    expect(sessionLabel('shortBreak')).toBe('Descanso curto')
    expect(sessionLabel('longBreak')).toBe('Descanso longo')
  })
})
