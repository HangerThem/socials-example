'use client'

import Image from 'next/image'
import { FollowButton } from '@/components/actions/FollowButton'
import { useProfile } from '@/context/profileContext'
import { useSession } from '@/lib/auth-client'

export default function ProfilePage() {
  const { user } = useProfile()
  const { data: session } = useSession()

  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-32 h-32 relative rounded-full overflow-hidden bg-foreground">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.image || 'User Avatar'}
              className="object-cover"
              fill
            />
          ) : (
            <span className="text-4xl font-bold flex items-center justify-center w-full h-full">
              {user.username?.[0] || 'U'}
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold">{user.displayUsername || user.username}</h1>
        <p className="text-sm text-muted">@{user.username}</p>
        <div className="flex gap-4 text-sm text-muted">
          <span>Following: {user._count.following}</span>
          <span>Followers: {user._count.followers}</span>
        </div>
        {session?.user.username !== user.username && (
          <>
            <span className="text-sm text-muted">
              This user {user.isFollower ? '' : 'does not'} follows you
            </span>
            <FollowButton />
          </>
        )}
      </div>
    </div>
  )
}
