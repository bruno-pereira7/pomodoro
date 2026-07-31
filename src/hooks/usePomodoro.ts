import { useEffect, useReducer, useRef } from 'react'
import {
  createTimerState,
  timerReducer,
  type CompletedSession,
  type Settings,
  type SessionType,
} from '../lib/timer'
import {
  loadPersistedTimer,
  loadSettings,
  rehydrateTimerState,
  saveSettings,
  saveTimer,
  type StorageLike,
} from '../lib/storage'

export interface PomodoroCallbacks {
  onSessionComplete?: (session: CompletedSession) => void
  notify?: (session: CompletedSession) => void
}

export function usePomodoro(storage: StorageLike, callbacks: PomodoroCallbacks = {}) {
  const [state, dispatch] = useReducer(timerReducer, undefined, () => {
    const settings = loadSettings(storage)
    const persisted = loadPersistedTimer(storage)
    if (persisted) {
      return rehydrateTimerState(persisted, settings, Date.now()).state
    }
    return createTimerState(settings)
  })

  const callbacksRef = useRef(callbacks)
  callbacksRef.current = callbacks

  const isRunning = state.status === 'running'

  useEffect(() => {
    if (!isRunning) return
    const id = setInterval(() => {
      dispatch({ type: 'tick', now: Date.now() })
    }, 500)
    return () => clearInterval(id)
  }, [isRunning])

  useEffect(() => {
    if (state.completedSession) {
      const session = state.completedSession
      dispatch({ type: 'clearCompleted' })
      callbacksRef.current.onSessionComplete?.(session)
      callbacksRef.current.notify?.(session)
    }
  }, [state.completedSession])

  useEffect(() => {
    saveTimer(storage, state)
  }, [storage, state])

  return {
    state,
    start: () => dispatch({ type: 'start', now: Date.now() }),
    pause: () => dispatch({ type: 'pause', now: Date.now() }),
    reset: () => dispatch({ type: 'reset' }),
    selectType: (type: SessionType) => dispatch({ type: 'selectType', sessionType: type }),
    updateSettings: (settings: Settings) => {
      saveSettings(storage, settings)
      dispatch({ type: 'applySettings', settings, now: Date.now() })
    },
  }
}
