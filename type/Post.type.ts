import { getPost, getPosts } from '@/server-actions/post'

export type PostSimple = NonNullable<Awaited<ReturnType<typeof getPosts>>>[number]

export type Post = NonNullable<Awaited<ReturnType<typeof getPost>>>
