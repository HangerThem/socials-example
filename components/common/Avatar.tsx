import { cn } from '@/utils/cn'
import Image from 'next/image'

type AvatarProps = {
  username: string
  size?: 'sm' | 'md' | 'lg' | 'profile' | 'full'
  src?: string | null
  alt?: string | null
  className?: string
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  profile: 'w-32 h-32',
  full: 'w-full h-auto aspect-square',
}

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  profile: 'text-5xl',
  full: 'text-6xl',
}

export function Avatar({ username, size = 'md', src, alt, className }: AvatarProps) {
  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden  border border-background bg-foreground',
        sizeClasses[size],
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={
            alt || `${username}'${username[username.length - 1] === 's' ? '' : 's'} profile picture`
          }
          className="object-cover"
          fill
        />
      ) : (
        <span
          className={cn('flex items-center justify-center w-full h-full', textSizeClasses[size])}
        >
          {username?.[0] || 'U'}
        </span>
      )}
    </div>
  )
}
