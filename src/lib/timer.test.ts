import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SETTINGS,
  createTimerState,
  formatTime,
  getProgress,
  nextSessionType,
  sessionDurationSeconds,
  timerReducer,
  type Settings,
  type TimerState,
} from './timer'

const T0 = 1_000_000_000

function makeState(overrides: Partial<TimerState> = {}): TimerState {
  return { ...createTimerState(DEFAULT_SETTINGS), ...overrides }
}

describe('sessionDurationSeconds', () => {
  it('returns durations in seconds', () => {
    expect(sessionDurationSeconds(DEFAULT_SETTINGS, 'focus')).toBe(1500)
    expect(sessionDurationSeconds(DEFAULT_SETTINGS, 'shortBreak')).toBe(300)
    expect(sessionDurationSeconds(DEFAULT_SETTINGS, 'longBreak')).toBe(900)
  })

  it('respects custom settings', () => {
    const settings: Settings = {
      focusMinutes: 50,
      shortBreakMinutes: 10,
      longBreakMinutes: 20,
      longBreakInterval: 4,
    }
    expect(sessionDurationSeconds(settings, 'focus')).toBe(3000)
    expect(sessionDurationSeconds(settings, 'shortBreak')).toBe(600)
    expect(sessionDurationSeconds(settings, 'longBreak')).toBe(1200)
  })
})

describe('nextSessionType', () => {
  it('returns shortBreak after non-multiple focus cycles', () => {
    expect(nextSessionType(1, 4)).toBe('shortBreak')
    expect(nextSessionType(3, 4)).toBe('shortBreak')
  })

  it('returns longBreak when cycles are a multiple of the interval', () => {
    expect(nextSessionType(4, 4)).toBe('longBreak')
    expect(nextSessionType(8, 4)).toBe('longBreak')
  })
})

describe('createTimerState', () => {
  it('starts idle at full focus duration', () => {
    const state = createTimerState(DEFAULT_SETTINGS)
    expect(state.type).toBe('focus')
    expect(state.status).toBe('idle')
    expect(state.remainingSeconds).toBe(1500)
    expect(state.totalSeconds).toBe(1500)
    expect(state.cyclesCompleted).toBe(0)
  })
})

describe('start / pause / resume', () => {
  it('starts and anchors endAt to now + remaining', () => {
    const next = timerReducer(makeState(), { type: 'start', now: T0 })
    expect(next.status).toBe('running')
    expect(next.endAt).toBe(T0 + 1500_000)
  })

  it('does not restart when already running', () => {
    const running = makeState({ status: 'running', endAt: T0 + 1500_000 })
    const next = timerReducer(running, { type: 'start', now: T0 + 10_000 })
    expect(next.endAt).toBe(T0 + 1500_000)
  })

  it('pauses and stores the remaining seconds based on elapsed time', () => {
    const running = makeState({ status: 'running', endAt: T0 + 1500_000 })
    const paused = timerReducer(running, { type: 'pause', now: T0 + 60_000 })
    expect(paused.status).toBe('paused')
    expect(paused.remainingSeconds).toBe(1440)
    expect(paused.endAt).toBeNull()
  })

  it('resumes by re-anchoring endAt from remaining seconds', () => {
    const paused = makeState({ status: 'paused', remainingSeconds: 1440 })
    const next = timerReducer(paused, { type: 'start', now: T0 + 5000 })
    expect(next.status).toBe('running')
    expect(next.endAt).toBe(T0 + 5000 + 1440_000)
  })

  it('ignores pause when not running', () => {
    const idle = makeState({ status: 'idle' })
    expect(timerReducer(idle, { type: 'pause', now: T0 })).toBe(idle)
  })
})

describe('tick', () => {
  it('decrements remaining based on wall clock', () => {
    const running = makeState({ status: 'running', endAt: T0 + 1500_000 })
    const ticked = timerReducer(running, { type: 'tick', now: T0 + 90_000 })
    expect(ticked.remainingSeconds).toBe(1410)
    expect(ticked.status).toBe('running')
  })

  it('transitions to shortBreak after focus completes', () => {
    const running = makeState({ status: 'running', endAt: T0 + 1500_000 })
    const next = timerReducer(running, { type: 'tick', now: T0 + 1500_000 })
    expect(next.type).toBe('shortBreak')
    expect(next.status).toBe('idle')
    expect(next.cyclesCompleted).toBe(1)
    expect(next.remainingSeconds).toBe(300)
  })

  it('transitions to longBreak after every N-th focus', () => {
    const beforeLong = makeState({
      type: 'focus',
      status: 'running',
      cyclesCompleted: 3,
      remainingSeconds: 1,
      totalSeconds: 1500,
      endAt: T0 + 1000,
    })
    const next = timerReducer(beforeLong, { type: 'tick', now: T0 + 1000 })
    expect(next.type).toBe('longBreak')
    expect(next.cyclesCompleted).toBe(4)
  })

  it('returns to focus after a break', () => {
    const breakState = makeState({
      type: 'shortBreak',
      status: 'running',
      cyclesCompleted: 2,
      remainingSeconds: 300,
      totalSeconds: 300,
      endAt: T0 + 300_000,
    })
    const next = timerReducer(breakState, { type: 'tick', now: T0 + 300_000 })
    expect(next.type).toBe('focus')
    expect(next.cyclesCompleted).toBe(2)
  })

  it('is a no-op when not running', () => {
    const idle = makeState({ status: 'idle' })
    expect(timerReducer(idle, { type: 'tick', now: T0 + 500_000 })).toBe(idle)
  })
})

describe('selectType', () => {
  it('switches session type and resets to idle', () => {
    const next = timerReducer(makeState(), { type: 'selectType', sessionType: 'longBreak' })
    expect(next.type).toBe('longBreak')
    expect(next.status).toBe('idle')
    expect(next.remainingSeconds).toBe(900)
  })
})

describe('reset', () => {
  it('resets remaining to full duration and stops', () => {
    const running = makeState({
      status: 'running',
      remainingSeconds: 100,
      endAt: T0 + 100_000,
    })
    const next = timerReducer(running, { type: 'reset' })
    expect(next.status).toBe('idle')
    expect(next.remainingSeconds).toBe(1500)
    expect(next.endAt).toBeNull()
  })
})

describe('applySettings', () => {
  it('updates durations for the current session', () => {
    const custom: Settings = { ...DEFAULT_SETTINGS, focusMinutes: 50 }
    const next = timerReducer(makeState(), {
      type: 'applySettings',
      settings: custom,
      now: T0,
    })
    expect(next.settings).toEqual(custom)
    expect(next.totalSeconds).toBe(3000)
    expect(next.remainingSeconds).toBe(3000)
  })

  it('clamps remaining seconds when the new duration is shorter', () => {
    const running = makeState({
      status: 'running',
      remainingSeconds: 2000,
      totalSeconds: 3000,
      endAt: T0 + 2000_000,
    })
    const custom: Settings = { ...DEFAULT_SETTINGS, focusMinutes: 25 }
    const next = timerReducer(running, {
      type: 'applySettings',
      settings: custom,
      now: T0,
    })
    expect(next.remainingSeconds).toBe(1500)
    expect(next.endAt).toBe(T0 + 1500_000)
  })
})

describe('formatTime', () => {
  it('formats minutes and seconds', () => {
    expect(formatTime(1500)).toBe('25:00')
    expect(formatTime(60)).toBe('1:00')
    expect(formatTime(9)).toBe('0:09')
  })
})

describe('getProgress', () => {
  it('returns the fraction of time remaining', () => {
    const half = makeState({ remainingSeconds: 750, totalSeconds: 1500 })
    expect(getProgress(half)).toBe(0.5)
  })

  it('returns 0 when total is 0', () => {
    expect(getProgress(makeState({ totalSeconds: 0 }))).toBe(0)
  })
})
