import { getPosts } from '@/actions/post'
import { PostsProvider } from '@/context/postsContext'
import { PostsList } from '@/components/PostsList'

export default async function AppPage() {
  const posts = await getPosts()

  return (
    <PostsProvider posts={posts}>
      <PostsList />
    </PostsProvider>
  )
}
