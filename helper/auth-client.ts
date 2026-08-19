import { authClient } from '@/lib/auth-client'
import type { CustomSession } from '@/types/Session.type'

export const useSession = () => {
  const session = authClient.useSession()
  return session as {
    data: CustomSession | null
    error: Error | null
    isPending: boolean
  }
}
