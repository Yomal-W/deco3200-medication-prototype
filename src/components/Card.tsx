import type { ReactNode } from 'react'

interface CardProps {
  tone?: 'default' | 'accent' | 'success' | 'attention' | 'sunken'
  raised?: boolean
  className?: string
  children: ReactNode
}

/** Rounded surface used for every grouped block of information. */
export function Card({ tone = 'default', raised = false, className = '', children }: CardProps) {
  const classes = [
    'card',
    tone === 'default' ? '' : `card--${tone}`,
    raised ? 'card--raised' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return <section className={classes}>{children}</section>
}
