import { cn } from '@/utils/cn'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'small' | 'medium' | 'large'
  align?: 'start' | 'center' | 'end'
  isLoading?: boolean
}

export const Button = ({
  variant = 'primary',
  size = 'medium',
  align = 'center',
  isLoading = false,
  className = '',
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(
        'btn',
        { [`btn-${variant}`]: variant },
        { [`btn-${size}`]: size },
        { [`btn-align-${align}`]: align },
        className,
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? 'Loading...' : props.children}
    </button>
  )
}
