'use client'

import { MessageCircle } from 'lucide-react'
import { Button } from '../ui/Button'
import { Modal } from '../modal/Modal'
import { useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { commentSchema, type CommentSchema } from '@/schema/Comment.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Textarea } from '../ui/Textarea'
import type { Post } from '@/types/Post.type'
import { usePosts } from '@/context/postsContext'
import { formatRelative } from 'date-fns'
import { Avatar } from '../common/Avatar'
import Link from 'next/link'
import { MentionTextarea } from '../ui/MentionTextarea'

type CommentButtonProps = {
  post: Post
  comments: number
}

export function CommentButton({ post, comments }: CommentButtonProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const { postComment } = usePosts()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CommentSchema>({
    defaultValues: {
      content: '',
    },
    resolver: zodResolver(commentSchema),
  })

  const content = useWatch({ control, name: 'content' })
  const contentLength = content ? content.length : 0

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
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <MentionTextarea
                error={errors.content?.message}
                placeholder="Write your comment..."
                maxLength={280}
                onUpdate={(html, text) => {
                  field.onChange(text)
                }}
                {...field}
              />
            )}
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
