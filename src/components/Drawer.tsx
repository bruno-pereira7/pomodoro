import { useEffect, useRef, type ReactNode } from 'react'

export function Drawer({
  open,
  onClose,
  children,
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
}) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const asideRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab') return
      const focusables = asideRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (!focusables || focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      previous?.focus()
    }
  }, [open, onClose])

  return (
    <div className={`drawer-shell${open ? ' drawer-shell--open' : ''}`}>
      <div className="drawer__backdrop" onClick={onClose} aria-hidden="true" />
      <aside
        ref={asideRef}
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Configurações e histórico"
        inert={!open}
      >
        <div className="drawer__header">
          <h2 className="drawer__title">Controles</h2>
          <button
            ref={closeRef}
            type="button"
            className="drawer__close"
            onClick={onClose}
            aria-label="Fechar"
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </aside>
    </div>
  )
}
