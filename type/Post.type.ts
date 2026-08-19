import { getPost, getPosts } from '@/actions/post'

export type PostSimple = NonNullable<Awaited<ReturnType<typeof getPosts>>>[number]

export type Post = NonNullable<Awaited<ReturnType<typeof getPost>>>
