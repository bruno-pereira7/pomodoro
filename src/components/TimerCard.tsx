import { formatTime, getProgress, sessionLabel } from '../lib/timer'
import type { TimerState, TimerStatus } from '../lib/timer'
import { ProgressRing } from './ProgressRing'
import { SegmentedControl } from './SegmentedControl'
import { Button } from './Button'

const STATUS_LABEL: Record<TimerStatus, string> = {
  idle: 'Pronto',
  running: 'Em andamento',
  paused: 'Pausado',
}

export function TimerCard({
  state,
  accent,
  onStart,
  onPause,
  onReset,
  onSelectType,
}: {
  state: TimerState
  accent: string
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onSelectType: (type: TimerState['type']) => void
}) {
  const primaryLabel =
    state.status === 'running'
      ? 'Pausar'
      : state.status === 'paused'
        ? 'Continuar'
        : 'Iniciar'
  const primaryAction = state.status === 'running' ? onPause : onStart

  return (
    <section className="timer-card">
      <SegmentedControl value={state.type} onChange={onSelectType} />
      <div className="timer__ring-wrap" data-running={state.status === 'running'}>
        <ProgressRing
          progress={getProgress(state)}
          color={accent}
          label={`${sessionLabel(state.type)}: ${formatTime(state.remainingSeconds)}`}
        />
        <div className="timer__readout" key={state.type}>
          <span className="timer__type">{sessionLabel(state.type)}</span>
          <time className="timer__time">{formatTime(state.remainingSeconds)}</time>
          <span className="timer__status" role="status" aria-live="polite">
            {STATUS_LABEL[state.status]}
          </span>
        </div>
      </div>
      <div className="timer__controls">
        <Button className="button button--primary" onClick={primaryAction}>
          {primaryLabel}
        </Button>
        <Button
          className="button button--ghost"
          onClick={onReset}
          aria-label="Reiniciar ciclo"
        >
          Reiniciar
        </Button>
      </div>
      <p className="timer__cycles">
        {state.cyclesCompleted % state.settings.longBreakInterval} de{' '}
        {state.settings.longBreakInterval} ciclos até o descanso longo
      </p>
    </section>
  )
}
