import type { SessionType } from '../lib/timer'

const SESSION_TABS: ReadonlyArray<{ type: SessionType; label: string }> = [
  { type: 'focus', label: 'Foco' },
  { type: 'shortBreak', label: 'Curto' },
  { type: 'longBreak', label: 'Longo' },
]

export function SegmentedControl({
  value,
  onChange,
}: {
  value: SessionType
  onChange: (type: SessionType) => void
}) {
  const index = Math.max(
    0,
    SESSION_TABS.findIndex((tab) => tab.type === value),
  )

  return (
    <div className="segmented" role="group" aria-label="Tipo de sessão">
      <span
        className="segmented__indicator"
        aria-hidden="true"
        style={{ transform: `translateX(${index * 100}%)` }}
      />
      {SESSION_TABS.map((tab) => (
        <button
          key={tab.type}
          type="button"
          className="segmented__button"
          aria-pressed={value === tab.type}
          onClick={() => onChange(tab.type)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
