'use client'

import { signOut } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

export default function LogoutPage() {
  const router = useRouter()
  signOut().then(() => router.push('/login'))

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Logging out...</h1>
      <p className="text-muted">You will be redirected to the login page shortly.</p>
    </div>
  )
}
