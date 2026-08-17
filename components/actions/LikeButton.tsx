'use client'

import { Heart } from 'lucide-react'
import { Button } from '../ui/Button'
import { cn } from '@/utils/cn'

type LikeButtonProps = {
  liked: boolean
  likes: number
  onClick: () => void
}

export function LikeButton({ liked, likes, onClick }: LikeButtonProps) {
  return (
    <Button size="small" variant="ghost" onClick={onClick} className={cn({ 'text-like': liked })}>
      <Heart className={cn('h-4 w-4', { 'fill-current': liked })} />
      {likes}
    </Button>
  )
}
