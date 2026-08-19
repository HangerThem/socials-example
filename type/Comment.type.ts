import { getComments } from '@/actions/comment'

export type Comment = NonNullable<Awaited<ReturnType<typeof getComments>>>[number]
