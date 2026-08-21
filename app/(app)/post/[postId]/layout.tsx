import { PostProvider } from '@/context/postContext'
import { getComments } from '@/actions/comment'
import { getPost } from '@/actions/post'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: LayoutProps<'/post/[postId]'>): Promise<Metadata> {
  const { postId } = await params
  const post = await getPost(postId)

  if (!post) {
    return {
      title: 'Post not found',
      description: 'The requested post could not be found.',
    }
  }

  return {
    title: `Post by ${post.author.username} | @handle`,
    description: post.content,
  }
}

export default async function ProfileLayout({ params, children }: LayoutProps<'/post/[postId]'>) {
  const { postId } = await params
  const post = await getPost(postId)
  const comments = await getComments(postId)

  if (!post) {
    return null
  }

  return (
    <PostProvider post={post} comments={comments}>
      {children}
    </PostProvider>
  )
}
