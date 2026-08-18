import { getComments } from '@/server-actions/comment'

export type Comment = NonNullable<Awaited<ReturnType<typeof getComments>>>[number]
