export function formatDurationMinutes(totalSeconds: number): string {
  const minutes = Math.round(totalSeconds / 60)
  return `${minutes} min`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}
