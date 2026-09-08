import type { ButtonHTMLAttributes } from 'react'
import { Icon } from './Icon'
import type { IconName } from './Icon'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'quiet'
  size?: 'md' | 'lg' | 'xl'
  icon?: IconName
  iconPosition?: 'start' | 'end'
  block?: boolean
}

/** Large, high-contrast action. Minimum touch target is set in CSS. */
export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'start',
  block = false,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const classes = [
    'btn',
    `btn--${variant}`,
    size === 'md' ? '' : `btn--${size}`,
    block ? 'btn--block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const glyph = icon ? <Icon name={icon} size={size === 'md' ? 22 : 26} /> : null

  return (
    <button type="button" className={classes} {...rest}>
      {iconPosition === 'start' ? glyph : null}
      <span>{children}</span>
      {iconPosition === 'end' ? glyph : null}
    </button>
  )
}
