'use client'

import type { Post } from '@/types/Post.type'
import Link from 'next/link'
import { Avatar } from '@/components/common/Avatar'
import { LikeButton } from '@/components/actions/LikeButton'
import { CommentButton } from '@/components/actions/CommentButton'
import { PostActions } from '@/components/actions/PostActions'
import { use, useState } from 'react'
import { formatRelative } from 'date-fns'
import { triggerPostLike } from '@/actions/post'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

type PostItemProps = {
  post: Post
  contentPromise: Promise<React.ReactNode[]>
  isCurrentUser: boolean
}

export function PostItem({ post, contentPromise, isCurrentUser }: PostItemProps) {
  const [liked, setLiked] = useState(post.liked)
  const [likes, setLikes] = useState(post._count.likes)
  const content = use(contentPromise)
  const router = useRouter()

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
          <span>{post.author.name ? post.author.name : post.author.username}</span>
          <span className="text-xs text-muted">@{post.author.username}</span>
        </div>
      </Link>
      <div className="whitespace-pre-wrap">{content}</div>
      {post.postFiles.length > 0 && (
        <div className="mt-1 grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2">
          {post.postFiles.map((postFile) => (
            <div
              className="group relative w-full h-auto aspect-square rounded-lg overflow-hidden border border-border"
              key={postFile.fileId}
            >
              <Image
                src={`/images/uploads/${postFile.file.path}`}
                alt={postFile.file.alt ?? ''}
                className="object-cover rounded"
                fill
              />
            </div>
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
