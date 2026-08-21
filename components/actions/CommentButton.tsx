'use client'

import { MessageCircle } from 'lucide-react'
import { Button } from '../ui/Button'
import { Modal } from '../modal/Modal'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { commentSchema, type CommentSchema } from '@/schema/Comment.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Textarea } from '../ui/Textarea'
import type { Post } from '@/types/Post.type'
import { usePosts } from '@/context/postsContext'
import { renderMessageContent } from '@/utils/text'
import { formatRelative } from 'date-fns'
import { Avatar } from '../common/Avatar'
import Link from 'next/link'

type CommentButtonProps = {
  post: Post
  comments: number
}

export function CommentButton({ post, comments }: CommentButtonProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const { postComment } = usePosts()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CommentSchema>({
    defaultValues: {
      content: '',
    },
    resolver: zodResolver(commentSchema),
  })

  const onSubmit = (data: CommentSchema) => {
    postComment(post.id, data.content)
    setModalOpen(false)
  }

  return (
    <>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div>
          <Link
            href={`/profile/${post.author.username}`}
            className="group flex items-center gap-2 w-fit"
            onClick={(e) => e.stopPropagation()}
          >
            <Avatar username={post.author.username} src={post.author.image} />
            <div className="flex flex-col">
              <span>{post.author.name}</span>
              <span className="text-xs text-muted">@{post.author.username}</span>
            </div>
          </Link>
          <div className="whitespace-pre-wrap">{post.processedContent}</div>
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
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Textarea
            {...register('content')}
            placeholder="Write your comment..."
            error={errors.content?.message}
          />
          <div className="flex gap-2 mt-2">
            <Button type="submit" size="small" variant="primary">
              Submit
            </Button>
            <Button size="small" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
      <Button size="small" variant="ghost" onClick={() => setModalOpen(true)}>
        <MessageCircle className="h-4 w-4" />
        {comments}
      </Button>
    </>
  )
}
