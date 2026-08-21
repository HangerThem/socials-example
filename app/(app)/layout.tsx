import { Sidebar } from '@/components/layout/Sidebar'
import { getSession } from '@/helper/auth'
import { redirect } from 'next/navigation'

export default async function AppLayout({ children, modal }: LayoutProps<'/'>) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-full flex">
      <Sidebar />
      <main className="flex-3">{children}</main>
      <div className="flex-2 border-l border-border" />
      {modal}
    </div>
  )
}
