import { useEffect, useState } from 'react'
import { DEFAULT_SETTINGS, type Settings } from '../lib/timer'

const FIELDS: ReadonlyArray<{
  key: keyof Settings
  label: string
  min: number
  max: number
}> = [
  { key: 'focusMinutes', label: 'Foco (min)', min: 1, max: 180 },
  { key: 'shortBreakMinutes', label: 'Descanso curto (min)', min: 1, max: 60 },
  { key: 'longBreakMinutes', label: 'Descanso longo (min)', min: 1, max: 60 },
  { key: 'longBreakInterval', label: 'Ciclos antes do longo', min: 1, max: 12 },
]

export function SettingsPanel({
  settings,
  onSave,
}: {
  settings: Settings
  onSave: (settings: Settings) => void
}) {
  const [draft, setDraft] = useState<Settings>(settings)

  useEffect(() => {
    setDraft(settings)
  }, [settings])

  const update = (key: keyof Settings, value: number) => {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  return (
    <section className="card">
      <div className="card__header">
        <h2 className="card__title">Configurações</h2>
      </div>
      <form
        className="settings__form"
        onSubmit={(event) => {
          event.preventDefault()
          onSave(draft)
        }}
      >
        {FIELDS.map((field) => (
          <label key={field.key} className="settings__field">
            <span>{field.label}</span>
            <input
              type="number"
              min={field.min}
              max={field.max}
              value={draft[field.key]}
              onChange={(event) => update(field.key, Number(event.target.value))}
            />
          </label>
        ))}
        <div className="settings__actions">
          <button
            type="button"
            className="button button--ghost"
            onClick={() => setDraft(DEFAULT_SETTINGS)}
          >
            Padrão
          </button>
          <button type="submit" className="button button--primary">
            Salvar
          </button>
        </div>
      </form>
    </section>
  )
}
