import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import type { CustomSession } from '@/types/Session.type'

export async function getSession(): Promise<CustomSession | null> {
  const session = (await auth.api.getSession({
    headers: await headers(),
  })) as CustomSession | null

  if (!session) return null

  return session
}
