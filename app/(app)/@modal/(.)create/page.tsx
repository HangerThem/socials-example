'use client'

import { Modal } from '@/components/modal/Modal'
import { CreateForm } from '@/components/forms/CreateForm'
import { useRouter } from 'next/navigation'

export default function CreateModal() {
  const router = useRouter()
  return (
    <Modal onClose={() => router.back()} open={true}>
      <CreateForm />
    </Modal>
  )
}
