import { Sidebar } from '@/components/layout/Sidebar'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AppLayout({ children, modal }: LayoutProps<'/'>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-full flex">
      <Sidebar />
      <main className="flex-4">{children}</main>
      <div className="flex-2" />
      {modal}
    </div>
  )
}
