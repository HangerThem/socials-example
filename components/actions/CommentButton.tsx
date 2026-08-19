'use client'

import { MessageCircle } from 'lucide-react'
import { Button } from '../ui/Button'
import { Modal } from '../modal/Modal'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { commentSchema, type CommentSchema } from '@/schema/Comment.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Textarea } from '../ui/Textarea'
import { PostSimple } from '@/types/Post.type'
import { usePosts } from '@/context/postsContext'

type CommentButtonProps = {
  post: PostSimple
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
        <h3 className="text-lg font-semibold mb-2">Comment</h3>
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
