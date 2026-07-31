import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

class MockNotification {
  static permission: NotificationPermission = 'granted'
  static instances: Array<{ title: string; options: NotificationOptions }> = []

  constructor(title: string, options: NotificationOptions) {
    MockNotification.instances.push({ title, options })
  }

  static requestPermission(): Promise<NotificationPermission> {
    return Promise.resolve('granted')
  }

  static reset() {
    MockNotification.instances = []
  }
}

function openDrawer() {
  fireEvent.click(screen.getByRole('button', { name: 'Abrir configurações e histórico' }))
}

function drawerShell() {
  return document.querySelector('.drawer-shell')
}

function drawerAside() {
  return screen.getByRole('dialog', { hidden: true })
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(1_000_000_000)
  window.localStorage.clear()
  MockNotification.reset()
  vi.stubGlobal('Notification', MockNotification)
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('App', () => {
  it('renders the timer at the default duration', () => {
    render(<App />)
    expect(screen.getByText('25:00')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Iniciar' })).toBeInTheDocument()
  })

  it('starts, pauses and resumes', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar' }))
    expect(screen.getByRole('button', { name: 'Pausar' })).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(60_000))
    expect(screen.getByText('24:00')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Pausar' }))
    act(() => vi.advanceTimersByTime(10_000))
    expect(screen.getByText('24:00')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }))
    act(() => vi.advanceTimersByTime(60_000))
    expect(screen.getByText('23:00')).toBeInTheDocument()
  })

  it('switches session types manually', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Longo' }))
    expect(screen.getByText('15:00')).toBeInTheDocument()
  })

  it('keeps settings and history hidden until the drawer is opened', () => {
    render(<App />)
    expect(drawerShell()).not.toHaveClass('drawer-shell--open')
    expect(drawerAside()).toHaveAttribute('inert')
    expect(screen.getByLabelText('Foco (min)').closest('[inert]')).not.toBeNull()

    openDrawer()
    expect(drawerShell()).toHaveClass('drawer-shell--open')
    expect(drawerAside()).not.toHaveAttribute('inert')
    expect(screen.getByLabelText('Foco (min)').closest('[inert]')).toBeNull()
  })

  it('closes the drawer with the close button and with Escape', () => {
    render(<App />)
    openDrawer()
    expect(drawerShell()).toHaveClass('drawer-shell--open')
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(drawerShell()).not.toHaveClass('drawer-shell--open')

    openDrawer()
    act(() => {
      fireEvent.keyDown(window, { key: 'Escape' })
    })
    expect(drawerShell()).not.toHaveClass('drawer-shell--open')
  })

  it('completes a focus, records history and notifies', () => {
    render(<App />)
    openDrawer()
    expect(screen.getByText('Nenhuma sessão concluída ainda. Comece um ciclo de foco.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }))

    fireEvent.click(screen.getByRole('button', { name: 'Iniciar' }))
    act(() => vi.advanceTimersByTime(1500_000))

    expect(MockNotification.instances).toHaveLength(1)
    expect(MockNotification.instances[0].title).toBe('Hora do descanso!')
    expect(screen.getByText('Descanso curto')).toBeInTheDocument()

    openDrawer()
    expect(screen.getAllByText('25 min').length).toBeGreaterThan(0)
  })

  it('counts focus sessions completed today', () => {
    render(<App />)
    expect(screen.getByText('Nenhum foco hoje')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar' }))
    act(() => vi.advanceTimersByTime(1500_000))
    expect(screen.getByText('1 foco hoje')).toBeInTheDocument()
  })

  it('saves custom settings and applies them to the timer', () => {
    render(<App />)
    openDrawer()
    const focusInput = screen.getByLabelText('Foco (min)')
    fireEvent.change(focusInput, { target: { value: '40' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(screen.getByText('40:00')).toBeInTheDocument()
  })

  it('reloads a running session on a second mount', () => {
    const first = render(<App />)
    fireEvent.click(first.getByRole('button', { name: 'Iniciar' }))
    act(() => vi.advanceTimersByTime(60_000))
    first.unmount()

    render(<App />)
    expect(screen.getByText('24:00')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pausar' })).toBeInTheDocument()
  })
})
