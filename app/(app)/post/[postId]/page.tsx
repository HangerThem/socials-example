'use client'

import { useSession } from '@/helper/auth-client'
import { usePost } from '@/context/postContext'
import Link from 'next/link'
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
import Image from 'next/image'
import { MessageCircle } from 'lucide-react'

export default function PostPage() {
  const { post, toggleLike, comments, postComment } = usePost()
  const { data: session } = useSession()

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

  return (
    <>
      <article className="border-b border-border p-4">
        <Link
          href={`/profile/${post.author.username}`}
          className="group flex items-center gap-2 w-fit"
        >
          <Avatar username={post.author.username} src={post.author.image} />
          <div className="flex flex-col">
            <span>{post.author.name}</span>
            <span className="text-xs text-muted">@{post.author.username}</span>
          </div>
        </Link>
        <div className="whitespace-pre-wrap">{post.processedContent}</div>
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
            <LikeButton liked={post.liked} likes={post._count.likes} onClick={toggleLike} />
            <span className="inline-flex items-center gap-1 font-medium px-2 py-1 text-sm">
              <MessageCircle className="inline-block w-4 h-4" />
              {post._count.comments}
            </span>
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
