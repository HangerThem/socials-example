'use client'

import Link from 'next/link'
import { Avatar } from '@/components/common/Avatar'
import { LikeButton } from '@/components/actions/LikeButton'
import { renderMessageContent } from '@/utils/text'
import { useEffect, useState } from 'react'
import { formatRelative } from 'date-fns'
import { Comment } from '@/types/Comment.type'
import { usePost } from '@/context/postContext'
import { CommentActions } from '../actions/CommentActions'
import { useSession } from '@/helper/auth-client'

type CommentItemProps = {
  comment: Comment
}

export function CommentItem({ comment }: CommentItemProps) {
  const { toggleCommentLike } = usePost()
  const { data: session } = useSession()
  const [content, setContent] = useState<React.ReactNode[]>([])

  useEffect(() => {
    renderMessageContent(comment.content).then(setContent)
  }, [comment.content])

  return (
    <div key={comment.id} className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <Link
          href={`/profile/${comment.author.username}`}
          className="group flex items-center gap-2 w-fit"
        >
          <Avatar username={comment.author.username} size="sm" src={comment.author.image} />
          <div className="flex items-center gap-2">
            <span>{comment.author.name || comment.author.username}</span>
            <span className="text-xs text-muted">@{comment.author.username}</span>
          </div>
        </Link>
        <time
          dateTime={new Date(comment.createdAt).toISOString()}
          className="text-xs text-muted capitalize"
        >
          {formatRelative(new Date(comment.createdAt), new Date())}
        </time>
      </div>
      <div className="whitespace-pre-wrap text-muted text-sm">{content}</div>
      <div className="flex items-center justify-between">
        <LikeButton
          liked={comment.liked}
          likes={comment._count.commentLikes}
          onClick={() => toggleCommentLike(comment.id)}
        />
        {session && session.user.id === comment.author.id && (
          <CommentActions commentId={comment.id} />
        )}
      </div>
    </div>
  )
}
