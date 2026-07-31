import type { HistoryEntry } from '../lib/storage'
import { sessionLabel, type SessionType } from '../lib/timer'
import { formatDate, formatDurationMinutes } from '../lib/format'

const TYPE_COLOR: Record<SessionType, string> = {
  focus: 'var(--accent-focus)',
  shortBreak: 'var(--accent-break)',
  longBreak: 'var(--accent-break)',
}

export function HistoryPanel({
  entries,
  onClear,
}: {
  entries: HistoryEntry[]
  onClear: () => void
}) {
  return (
    <section className="card">
      <div className="card__header">
        <h2 className="card__title">Histórico</h2>
        <button
          type="button"
          className="button button--ghost button--small"
          onClick={onClear}
          disabled={entries.length === 0}
        >
          Limpar
        </button>
      </div>
      {entries.length === 0 ? (
        <p className="history__empty">
          Nenhuma sessão concluída ainda. Comece um ciclo de foco.
        </p>
      ) : (
        <ul className="history__list">
          {entries.map((entry) => (
            <li key={entry.id} className="history__row">
              <span
                className="history__dot"
                style={{ background: TYPE_COLOR[entry.type] }}
                aria-hidden="true"
              />
              <span className="history__type">{sessionLabel(entry.type)}</span>
              <span className="history__duration">
                {formatDurationMinutes(entry.durationSeconds)}
              </span>
              <span className="history__cycle">Ciclo {entry.cyclesCompleted}</span>
              <time className="history__date">{formatDate(entry.date)}</time>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
