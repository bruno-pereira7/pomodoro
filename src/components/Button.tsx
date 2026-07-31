import { useRef, type ButtonHTMLAttributes, type MouseEvent } from 'react'

export function Button({
  children,
  className = '',
  onClick,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const ref = useRef<HTMLButtonElement>(null)

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    const el = ref.current
    if (el) {
      const rect = el.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height) * 2.2
      const ripple = document.createElement('span')
      ripple.className = 'ripple'
      ripple.style.width = `${size}px`
      ripple.style.height = `${size}px`
      ripple.style.left = `${event.clientX - rect.left - size / 2}px`
      ripple.style.top = `${event.clientY - rect.top - size / 2}px`
      el.appendChild(ripple)
      ripple.addEventListener('animationend', () => ripple.remove())
    }
    onClick?.(event)
  }

  return (
    <button ref={ref} type="button" className={className} onClick={handleClick} {...rest}>
      {children}
    </button>
  )
}
