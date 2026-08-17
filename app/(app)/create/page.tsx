import { CreateForm } from '@/components/forms/CreateForm'

export default function CreatePage() {
  return (
    <div className="px-8 py-6">
      <h1 className="text-3xl font-bold mb-4">Create a new post</h1>
      <CreateForm />
    </div>
  )
}
