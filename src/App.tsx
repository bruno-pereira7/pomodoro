import { useMemo, useState } from 'react'
import { usePomodoro } from './hooks/usePomodoro'
import { useHistory } from './hooks/useHistory'
import { createHistoryEntry } from './lib/storage'
import { requestNotificationPermission, notifySessionCompleted } from './lib/notify'
import type { SessionType } from './lib/timer'
import { TimerCard } from './components/TimerCard'
import { SettingsPanel } from './components/SettingsPanel'
import { HistoryPanel } from './components/HistoryPanel'
import { EmberBurst } from './components/EmberBurst'
import { Background3D } from './components/Background3D'
import { ClickWave } from './components/ClickWave'
import { Drawer } from './components/Drawer'
import './App.css'

const ACCENT: Record<SessionType, string> = {
  focus: 'var(--accent-focus)',
  shortBreak: 'var(--accent-break)',
  longBreak: 'var(--accent-break)',
}

const ACCENT_VAR: Record<SessionType, string> = {
  focus: '--accent-focus',
  shortBreak: '--accent-break',
  longBreak: '--accent-break',
}

const ACCENT_FALLBACK: Record<SessionType, string> = {
  focus: '#f43a2e',
  shortBreak: '#10a598',
  longBreak: '#10a598',
}

function resolveAccentHex(type: SessionType): string {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(ACCENT_VAR[type])
    .trim()
  return value.startsWith('#') ? value : ACCENT_FALLBACK[type]
}

function App() {
  const storage = window.localStorage
  const history = useHistory(storage)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [burst, setBurst] = useState({ key: 0, color: resolveAccentHex('focus') })

  const timer = usePomodoro(storage, {
    onSessionComplete: (session) => {
      history.add(createHistoryEntry(session, Date.now()))
      setBurst((current) => ({
        key: current.key + 1,
        color: resolveAccentHex(session.type),
      }))
    },
    notify: notifySessionCompleted,
  })

  const accent = ACCENT[timer.state.type]

  const todayFocusCount = useMemo(() => {
    const today = new Date().toDateString()
    return history.entries.filter(
      (entry) => entry.type === 'focus' && new Date(entry.date).toDateString() === today,
    ).length
  }, [history.entries])

  const handleStart = () => {
    requestNotificationPermission()
    timer.start()
  }

  return (
    <div className="app" style={{ ['--accent' as string]: accent }}>
      <Background3D />
      <div className="hero-glow" aria-hidden="true" />
      <EmberBurst burstKey={burst.key} color={burst.color} />
      <ClickWave />

      <header className="app__top">
        <h1 className="app__title">Pomodoro</h1>
        <div className="app__actions">
          <span className="app__stat">
            {todayFocusCount === 0
              ? 'Nenhum foco hoje'
              : `${todayFocusCount} ${todayFocusCount === 1 ? 'foco' : 'focos'} hoje`}
          </span>
          <button
            type="button"
            className="app__settings-button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir configurações e histórico"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </header>

      <main className="app__main">
        <TimerCard
          state={timer.state}
          accent={accent}
          onStart={handleStart}
          onPause={timer.pause}
          onReset={timer.reset}
          onSelectType={timer.selectType}
        />
      </main>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <div className="drawer__body">
          <SettingsPanel settings={timer.state.settings} onSave={timer.updateSettings} />
          <HistoryPanel entries={history.entries} onClear={history.clear} />
        </div>
      </Drawer>
    </div>
  )
}

export default App
