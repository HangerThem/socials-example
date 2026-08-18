'use client'

import { FollowButton } from '@/components/actions/FollowButton'
import { useProfile } from '@/context/profileContext'
import { useSession } from '@/lib/auth-client'
import { Avatar } from '@/components/common/Avatar'
import { PostsList } from '@/components/PostsList'

export default function ProfilePage() {
  const { user } = useProfile()
  const { data: session } = useSession()

  return (
    <div className="flex flex-col h-full w-full">
      <div className="w-full relative">
        <div className="w-full h-48 bg-accent" />
        <Avatar
          username={user.username}
          src={user.image}
          size="profile"
          className="absolute -bottom-16 left-12 border-4 border-background"
        />
      </div>
      <div className="flex gap-1 mt-16 px-4 items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{user.displayUsername || user.username}</h1>
          <p className="text-sm text-muted">@{user.username}</p>
          <div className="flex gap-4 text-sm text-muted">
            <span>{user._count.following} following</span>
            <span>{user._count.followers} followers</span>
            <span>{user._count.posts} posts</span>
          </div>
          <p>{user.bio}</p>
        </div>
        {session && session.user.username !== user.username && <FollowButton />}
      </div>

      <PostsList />
    </div>
  )
}
