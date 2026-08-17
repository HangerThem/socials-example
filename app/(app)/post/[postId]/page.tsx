'use client'

import { useSession } from '@/lib/auth-client'
import { usePost } from '@/context/postContext'
import Link from 'next/link'
import { renderMessageContent } from '@/utils/text'
import { useEffect, useState } from 'react'
import { Avatar } from '@/components/common/Avatar'
import { LikeButton } from '@/components/actions/LikeButton'
import { formatRelative } from 'date-fns'
import { PostActions } from '@/components/actions/PostActions'

export default function PostPage() {
  const { post, toggleLike } = usePost()
  const { data: session } = useSession()
  const [content, setContent] = useState<React.ReactNode[]>([])

  useEffect(() => {
    renderMessageContent(post.content).then(setContent)
  }, [post.content])

  return (
    <article className="first:border-y border-b border-border p-4">
      <Link
        href={`/profile/${post.author.username}`}
        className="group flex items-center gap-2 w-fit"
      >
        <Avatar username={post.author.username} src={post.author.image} />
        <div className="flex flex-col">
          <span>
            {post.author.displayUsername ? post.author.displayUsername : post.author.username}
          </span>
          <span className="text-xs text-muted">@{post.author.username}</span>
        </div>
      </Link>
      <div className="whitespace-pre-wrap">{content}</div>
      {post.postFiles.length > 0 && (
        <div className="mt-2 flex gap-2">
          {post.postFiles.map((postFile) => (
            <img
              key={postFile.file.id}
              src={postFile.file.url}
              alt={postFile.file.alt ?? ''}
              className="max-w-xs max-h-60 object-cover rounded"
            />
          ))}
        </div>
      )}
      <time
        dateTime={new Date(post.createdAt).toISOString()}
        className="text-xs text-muted capitalize"
      >
        {formatRelative(new Date(post.createdAt), new Date())}
      </time>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <LikeButton liked={post.liked} likes={post._count.likes} onClick={toggleLike} />
        </div>
        {post.authorId === session?.user.id && <PostActions postId={post.id} />}
      </div>

      <div>
        {post.comments.map((comment) => (
          <div key={comment.id}>
            <Link
              href={`/profile/${comment.author.username}`}
              className="group flex items-center gap-2 w-fit"
            >
              <Avatar username={comment.author.username} size="sm" src={comment.author.image} />
              <div className="flex items-center gap-2">
                <span>
                  {comment.author.displayUsername
                    ? comment.author.displayUsername
                    : comment.author.username}
                </span>
                <span className="text-xs text-muted">@{comment.author.username}</span>
              </div>
            </Link>
            <p>{comment.content}</p>
            <time
              dateTime={new Date(comment.createdAt).toISOString()}
              className="text-xs text-muted capitalize"
            >
              {formatRelative(new Date(comment.createdAt), new Date())}
            </time>
          </div>
        ))}
      </div>
    </article>
  )
}
