import type { User } from '@/types/User.type'
import type { Session } from 'better-auth'

export type CustomSession = {
  user: User
  session: Session
}
