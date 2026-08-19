'use client'

import { useSession } from '@/helper/auth-client'
import { usePost } from '@/context/postContext'
import Link from 'next/link'
import { renderMessageContent } from '@/utils/text'
import { useEffect, useState } from 'react'
import { Avatar } from '@/components/common/Avatar'
import { LikeButton } from '@/components/actions/LikeButton'
import { formatRelative } from 'date-fns'
import { PostActions } from '@/components/actions/PostActions'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { useForm } from 'react-hook-form'
import { commentSchema, CommentSchema } from '@/schema/Comment.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { CommentItem } from '@/components/common/CommentItem'

export default function PostPage() {
  const { post, toggleLike, comments, postComment } = usePost()
  const { data: session } = useSession()
  const [content, setContent] = useState<React.ReactNode[]>([])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentSchema>({
    defaultValues: {
      content: '',
    },
    resolver: zodResolver(commentSchema),
  })

  const onSubmit = (data: CommentSchema) => {
    postComment(data.content).then(() => {
      reset()
    })
  }

  useEffect(() => {
    renderMessageContent(post.content).then(setContent)
  }, [post.content])

  return (
    <>
      <article className="border-b border-border p-4">
        <Link
          href={`/profile/${post.author.username}`}
          className="group flex items-center gap-2 w-fit"
        >
          <Avatar username={post.author.username} src={post.author.image} />
          <div className="flex flex-col">
            <span>{post.author.name ? post.author.name : post.author.username}</span>
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
            <LikeButton liked={post.liked} likes={post._count.likes} onClick={toggleLike} />
          </div>
          {post.authorId === session?.user.id && <PostActions postId={post.id} />}
        </div>
      </article>

      <div className="flex flex-col gap-4 p-3">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Textarea
            {...register('content')}
            placeholder="Write your comment..."
            error={errors.content?.message}
          />
          <Button type="submit" size="small" variant="primary">
            Submit
          </Button>
        </form>
        {comments
          .toSorted((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
      </div>
    </>
  )
}
