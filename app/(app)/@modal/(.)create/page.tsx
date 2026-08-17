'use client'

import { Modal } from '@/components/Modal'
import { CreateForm } from '@/components/forms/CreateForm'

export default function CreateModal() {
  return (
    <Modal onClose={() => {}} open={true}>
      <CreateForm />
    </Modal>
  )
}
