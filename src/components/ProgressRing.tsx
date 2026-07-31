export function ProgressRing({
  progress,
  color,
  label,
}: {
  progress: number
  color: string
  label: string
}) {
  const radius = 118
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - progress)

  return (
    <svg
      className="ring"
      viewBox="0 0 260 260"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
    >
      <circle className="ring__track" cx="130" cy="130" r={radius} />
      <circle
        className="ring__bar"
        cx="130"
        cy="130"
        r={radius}
        stroke={color}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
    </svg>
  )
}
