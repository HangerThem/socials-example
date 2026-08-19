'use client'

import { PostSimple } from '@/type/Post.type'
import Link from 'next/link'
import { Avatar } from '@/components/common/Avatar'
import { LikeButton } from '@/components/actions/LikeButton'
import { CommentButton } from '@/components/actions/CommentButton'
import { PostActions } from '@/components/actions/PostActions'
import { renderMessageContent } from '@/utils/text'
import { useEffect, useState } from 'react'
import { formatRelative } from 'date-fns'
import { triggerPostLike } from '@/actions/post'
import { useRouter } from 'next/navigation'

type PostItemProps = {
  post: PostSimple
  isCurrentUser: boolean
}

export function PostItem({ post, isCurrentUser }: PostItemProps) {
  const [liked, setLiked] = useState(post.liked)
  const [likes, setLikes] = useState(post._count.likes)
  const [content, setContent] = useState<React.ReactNode[]>([])
  const router = useRouter()

  useEffect(() => {
    renderMessageContent(post.content).then(setContent)
  }, [post.content])

  const handleLike = async () => {
    const originalState = { liked, likes }
    setLiked(!originalState.liked)
    setLikes(originalState.liked ? originalState.likes - 1 : originalState.likes + 1)
    try {
      await triggerPostLike(post.id)
    } catch (error) {
      setLiked(originalState.liked)
      setLikes(originalState.likes)
      console.error('Error liking post:', error)
    }
  }

  return (
    <article
      className="post-item block first:border-y border-b border-border p-4 cursor-pointer"
      onClick={() => router.push(`/post/${post.id}`)}
    >
      <Link
        href={`/profile/${post.author.username}`}
        className="group flex items-center gap-2 w-fit"
        onClick={(e) => e.stopPropagation()}
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
              src={postFile.file.path}
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
          <LikeButton liked={liked} likes={likes} onClick={handleLike} />
          <CommentButton post={post} comments={post._count.comments} />
        </div>
        {isCurrentUser && <PostActions postId={post.id} />}
      </div>
    </article>
  )
}
