export type SessionType = 'focus' | 'shortBreak' | 'longBreak'

export type TimerStatus = 'idle' | 'running' | 'paused'

export interface Settings {
  focusMinutes: number
  shortBreakMinutes: number
  longBreakMinutes: number
  longBreakInterval: number
}

export const DEFAULT_SETTINGS: Settings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
}

export interface TimerState {
  settings: Settings
  type: SessionType
  status: TimerStatus
  remainingSeconds: number
  totalSeconds: number
  cyclesCompleted: number
  endAt: number | null
  completedSession: CompletedSession | null
}

export interface CompletedSession {
  type: SessionType
  cyclesCompleted: number
  durationSeconds: number
}

export type TimerAction =
  | { type: 'start'; now: number }
  | { type: 'pause'; now: number }
  | { type: 'reset' }
  | { type: 'tick'; now: number }
  | { type: 'selectType'; sessionType: SessionType }
  | { type: 'applySettings'; settings: Settings; now: number }
  | { type: 'clearCompleted' }

export function sessionDurationSeconds(settings: Settings, type: SessionType): number {
  switch (type) {
    case 'focus':
      return settings.focusMinutes * 60
    case 'shortBreak':
      return settings.shortBreakMinutes * 60
    case 'longBreak':
      return settings.longBreakMinutes * 60
  }
}

export function nextSessionType(cyclesCompleted: number, longBreakInterval: number): SessionType {
  return cyclesCompleted > 0 && cyclesCompleted % longBreakInterval === 0
    ? 'longBreak'
    : 'shortBreak'
}

export function createTimerState(settings: Settings): TimerState {
  const totalSeconds = sessionDurationSeconds(settings, 'focus')
  return {
    settings,
    type: 'focus',
    status: 'idle',
    remainingSeconds: totalSeconds,
    totalSeconds,
    cyclesCompleted: 0,
    endAt: null,
    completedSession: null,
  }
}

function remainingSecondsAt(state: TimerState, now: number): number {
  if (state.endAt === null) return state.remainingSeconds
  return Math.max(0, Math.ceil((state.endAt - now) / 1000))
}

function transitionToNext(state: TimerState): TimerState {
  if (state.type === 'focus') {
    const cyclesCompleted = state.cyclesCompleted + 1
    const type = nextSessionType(cyclesCompleted, state.settings.longBreakInterval)
    const totalSeconds = sessionDurationSeconds(state.settings, type)
    return {
      ...state,
      type,
      status: 'idle',
      remainingSeconds: totalSeconds,
      totalSeconds,
      cyclesCompleted,
      endAt: null,
      completedSession: { type: state.type, cyclesCompleted, durationSeconds: state.totalSeconds },
    }
  }
  const totalSeconds = sessionDurationSeconds(state.settings, 'focus')
  return {
    ...state,
    type: 'focus',
    status: 'idle',
    remainingSeconds: totalSeconds,
    totalSeconds,
    endAt: null,
    completedSession: {
      type: state.type,
      cyclesCompleted: state.cyclesCompleted,
      durationSeconds: state.totalSeconds,
    },
  }
}

export function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'start':
      if (state.status === 'running' || state.remainingSeconds === 0) return state
      return {
        ...state,
        status: 'running',
        endAt: action.now + state.remainingSeconds * 1000,
      }
    case 'pause':
      if (state.status !== 'running') return state
      return {
        ...state,
        status: 'paused',
        remainingSeconds: remainingSecondsAt(state, action.now),
        endAt: null,
      }
    case 'reset':
      return {
        ...state,
        status: 'idle',
        remainingSeconds: state.totalSeconds,
        endAt: null,
      }
    case 'tick': {
      if (state.status !== 'running') return state
      const remaining = remainingSecondsAt(state, action.now)
      if (remaining > 0) return { ...state, remainingSeconds: remaining }
      return transitionToNext(state)
    }
    case 'selectType': {
      const totalSeconds = sessionDurationSeconds(state.settings, action.sessionType)
      return {
        ...state,
        type: action.sessionType,
        status: 'idle',
        remainingSeconds: totalSeconds,
        totalSeconds,
        endAt: null,
      }
    }
    case 'applySettings': {
      const totalSeconds = sessionDurationSeconds(action.settings, state.type)
      const notStarted =
        state.status === 'idle' && state.remainingSeconds === state.totalSeconds
      const remainingSeconds = notStarted
        ? totalSeconds
        : Math.min(state.remainingSeconds, totalSeconds)
      const endAt =
        state.status === 'running'
          ? action.now + remainingSeconds * 1000
          : state.endAt
      return {
        ...state,
        settings: action.settings,
        totalSeconds,
        remainingSeconds,
        endAt,
      }
    }
    case 'clearCompleted':
      return { ...state, completedSession: null }
  }
}

export function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function sessionLabel(type: SessionType): string {
  switch (type) {
    case 'focus':
      return 'Foco'
    case 'shortBreak':
      return 'Descanso curto'
    case 'longBreak':
      return 'Descanso longo'
  }
}

export function getProgress(state: TimerState): number {
  if (state.totalSeconds === 0) return 0
  return Math.max(0, Math.min(1, state.remainingSeconds / state.totalSeconds))
}
