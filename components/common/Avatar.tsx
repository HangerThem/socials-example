import { cn } from '@/utils/cn'
import Image from 'next/image'

type AvatarProps = {
  username: string
  size?: 'sm' | 'md' | 'lg'
  src?: string | null
  alt?: string | null
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
}

export function Avatar({ username, size = 'md', src, alt }: AvatarProps) {
  return (
    <div className={cn('relative rounded-full overflow-hidden bg-foreground', sizeClasses[size])}>
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
        <span className="text-xl font-bold flex items-center justify-center w-full h-full">
          {username?.[0] || 'U'}
        </span>
      )}
    </div>
  )
}
