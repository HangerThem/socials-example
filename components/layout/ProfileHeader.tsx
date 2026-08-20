'use client'

import { FollowButton } from '@/components/actions/FollowButton'
import { useProfile } from '@/context/profileContext'
import { useSession } from '@/helper/auth-client'
import { Avatar } from '@/components/common/Avatar'
import { Modal } from '@/components/modal/Modal'
import { UpdateProfilePictureForm } from '@/components/forms/UpdateProfilePictureForm'
import { useMemo, useState } from 'react'
import { cn } from '@/utils/cn'
import { Camera } from 'lucide-react'
import Link from 'next/link'

export function ProfileHeader() {
  const { user } = useProfile()
  const { data: session } = useSession()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const isCurrentUser = useMemo(
    () => session?.user.username === user.username,
    [session, user.username],
  )

  return (
    <header>
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} transparent={!isCurrentUser}>
        {isCurrentUser ? (
          <UpdateProfilePictureForm onCancel={() => setIsModalOpen(false)} />
        ) : (
          <Avatar username={user.username} src={user.image} size="full" />
        )}
      </Modal>
      <div className="flex flex-col h-full w-full">
        <div className="w-full relative">
          <div className="w-full h-48 bg-accent" />
          <button
            className={cn('group absolute -bottom-16 left-12 rounded-full overflow-hidden', {
              'cursor-pointer': user.image || isCurrentUser,
            })}
            onClick={() => (user.image || isCurrentUser) && setIsModalOpen(true)}
          >
            <Avatar
              username={user.username}
              src={user.image}
              size="profile"
              className="border-4 border-background"
            />
            {isCurrentUser && (
              <div className="inset-0 absolute bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-8 h-8 text-white" />
              </div>
            )}
          </button>
        </div>
        <div className="flex gap-1 mt-16 px-4 items-start justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">{user.name || user.username}</h1>
            <p className="text-sm text-muted">@{user.username}</p>
            <div className="flex gap-4 text-sm text-muted">
              <Link href={`/profile/${user.username}/following`} className="hover:underline">
                {user._count.following} following
              </Link>
              <Link href={`/profile/${user.username}/followers`} className="hover:underline">
                {user._count.followers} followers
              </Link>
              <Link href={`/profile/${user.username}`} className="hover:underline">
                {user._count.posts} posts
              </Link>
            </div>
            <p>{user.bio}</p>
          </div>
          {session && !isCurrentUser && <FollowButton />}
        </div>
      </div>
    </header>
  )
}
