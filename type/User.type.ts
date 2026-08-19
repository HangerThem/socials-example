import { getUserByUsername } from '@/actions/user'

export type User = NonNullable<Awaited<ReturnType<typeof getUserByUsername>>>
