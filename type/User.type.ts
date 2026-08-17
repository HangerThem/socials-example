import { getUserByUsername } from '@/server-actions/user'

export type User = NonNullable<Awaited<ReturnType<typeof getUserByUsername>>>
