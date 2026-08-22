'use client'

import Link from 'next/link'
import Tooltip from '../ui/Tooltip'
import { Avatar } from './Avatar'
import type { UserSimple } from '@/types/User.type'

type MentionItemProps = {
  user: UserSimple
}

export function MentionItem({ user }: MentionItemProps) {
  return (
    <Tooltip
      content={
        <div className="flex items-center gap-2 py-1">
          <Avatar username={user.username} src={user.image} />
          <div className="flex flex-col">
            <span>{user.name || user.username}</span>
            <span className="text-xs text-muted">@{user.username}</span>
          </div>
        </div>
      }
    >
      <Link
        href={`/profile/${user.username}`}
        className="post-mention"
        onClick={(e) => e.stopPropagation()}
      >
        @{user.username}
      </Link>
    </Tooltip>
  )
}
