import type { CompletedSession } from '../lib/timer'

export function completedNotificationTitle(session: CompletedSession): string {
  return session.type === 'focus' ? 'Hora do descanso!' : 'Hora de focar!'
}

export function completedNotificationBody(session: CompletedSession): string {
  return session.type === 'focus'
    ? 'Foco concluído. Faça uma pausa.'
    : 'Descanso concluído. De volta ao foco.'
}

export function notifySessionCompleted(session: CompletedSession): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission !== 'granted') return
  new Notification(completedNotificationTitle(session), {
    body: completedNotificationBody(session),
  })
}

export function requestNotificationPermission(): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission === 'default') {
    void Notification.requestPermission()
  }
}
