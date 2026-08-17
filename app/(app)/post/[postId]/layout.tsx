import { PostProvider } from '@/context/postContext'
import { getPost } from '@/server-actions/post'

export default async function ProfileLayout({ params, children }: LayoutProps<'/post/[postId]'>) {
  const { postId } = await params
  const post = await getPost(postId)

  if (!post) {
    return null
  }

  return <PostProvider post={post}>{children}</PostProvider>
}
