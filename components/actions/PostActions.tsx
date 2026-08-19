'use client'

import { EllipsisVertical, Pencil, Trash2 } from 'lucide-react'
import { Dropdown } from '@/components/ui/Dropdown'
import { Button } from '@/components/ui/Button'
import { deletePost } from '@/server-actions/post'
import { Modal } from '../modal/Modal'
import { useState } from 'react'

type PostActionsProps = {
  postId: string
}

export function PostActions({ postId }: PostActionsProps) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <h3 className="text-lg font-semibold mb-2">Delete Post</h3>
        <p className="mb-4 text-sm text-muted">Are you sure you want to delete this post?</p>
        <div className="flex gap-2">
          <Button
            size="small"
            variant="danger"
            onClick={async () => {
              await deletePost(postId)
              setModalOpen(false)
            }}
          >
            Delete
          </Button>
          <Button size="small" variant="ghost" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
        </div>
      </Modal>
      <Dropdown
        content={
          <div className="flex flex-col gap-1">
            <Button
              size="small"
              variant="ghost"
              align="start"
              onClick={() => console.log(`Edit post ${postId}`)}
            >
              <Pencil className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button size="small" variant="danger" align="start" onClick={() => setModalOpen(true)}>
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          </div>
        }
      >
        <EllipsisVertical className="h-4 w-4" />
      </Dropdown>
    </>
  )
}
