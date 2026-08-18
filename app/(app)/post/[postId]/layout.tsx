import { PostProvider } from '@/context/postContext'
import { getComments } from '@/server-actions/comment'
import { getPost } from '@/server-actions/post'

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
