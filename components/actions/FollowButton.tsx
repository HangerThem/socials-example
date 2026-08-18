'use client'

import { User, UserX } from 'lucide-react'
import { Button } from '../ui/Button'
import { useProfile } from '@/context/profileContext'

export function FollowButton() {
  const { user, toggleFollow } = useProfile()

  return (
    <Button size="small" variant="ghost" onClick={toggleFollow}>
      {user.isFollowing ? <UserX className="h-4 w-4" /> : <User className="h-4 w-4" />}
      {user.isFollowing ? 'Unfollow' : 'Follow'}
    </Button>
  )
}
