import { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import './fade-content.css'

type FadeContentProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  /** Agrega un desenfoque inicial que se aclara al aparecer. */
  blur?: boolean
  /** Duración en segundos. */
  duration?: number
  /** Retraso en segundos. */
  delay?: number
}

/** Entrada suave del contenido con CSS. Se desactiva con prefers-reduced-motion. */
export default function FadeContent({
  children,
  blur = false,
  duration = 0.45,
  delay = 0,
  className = '',
  style,
  ...props
}: FadeContentProps) {
  const timing = { '--fade-duration': `${duration}s`, '--fade-delay': `${delay}s` } as CSSProperties
  return (
    <div
      className={['fade-content', blur ? 'fade-content--blur' : '', className].filter(Boolean).join(' ')}
      style={{ ...timing, ...style }}
      {...props}
    >
      {children}
    </div>
  )
}
