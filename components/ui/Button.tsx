import { cn } from '@/utils/cn'
import Link from 'next/link'

type BaseProps = {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'small' | 'medium' | 'large'
  align?: 'start' | 'center' | 'end'
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full'
}

type ButtonProps = BaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    isLoading?: boolean
  }

type ButtonLinkProps = BaseProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    isLoading?: boolean
  }

export const Button = ({
  variant = 'primary',
  size = 'medium',
  align = 'center',
  rounded = 'md',
  isLoading = false,
  className = '',
  ...props
}: ButtonProps | ButtonLinkProps) => {
  const linkProps = props as ButtonLinkProps
  const buttonProps = props as ButtonProps

  if ('href' in props) {
    return (
      <Link
        href={linkProps.href as string}
        className={cn(
          'btn',
          { [`btn-${variant}`]: variant },
          { [`btn-${size}`]: size },
          { [`btn-align-${align}`]: align },
          { [`btn-rounded-${rounded}`]: rounded },
          className,
        )}
        {...linkProps}
      >
        {isLoading ? 'Loading...' : linkProps.children}
      </Link>
    )
  }

  return (
    <button
      className={cn(
        className,
        'btn',
        { [`btn-${variant}`]: variant },
        { [`btn-${size}`]: size },
        { [`btn-align-${align}`]: align },
        { [`btn-rounded-${rounded}`]: rounded },
      )}
      disabled={isLoading || buttonProps.disabled}
      {...buttonProps}
      onClick={(e) => {
        e.stopPropagation()
        buttonProps.onClick?.(e)
      }}
    >
      {isLoading ? 'Loading...' : buttonProps.children}
    </button>
  )
}
