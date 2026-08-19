import { getSession } from '@/helper/auth'
import { redirect } from 'next/navigation'

export default async function AuthLayout({ children }: LayoutProps<'/'>) {
  const session = await getSession()

  if (session) {
    redirect('/')
  }

  return (
    <div className="min-h-screen max-w-4xl mx-auto flex items-center justify-center gap-8">
      <div className="flex-1 flex flex-col items-center gap-4">
        <h1 className="text-4xl font-bold text-center text-accent">@handle</h1>
        <p className="text-center text-muted-foreground">
          A simple social media app built with Next.js, Prisma, and Better Auth.
        </p>
      </div>

      <div className="w-px h-160 bg-border" />

      <div className="flex-1">
        <div className="p-8 border border-border rounded-lg w-fit bg-background">{children}</div>
      </div>
    </div>
  )
}
