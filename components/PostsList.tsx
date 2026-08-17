'use client'

import { usePosts } from '@/context/postsContext'
import { PostItem } from './common/PostItem'
import { useSession } from '@/lib/auth-client'
import { Button } from './ui/Button'

export function PostsList() {
  const { data: session } = useSession()
  const { posts, hasMore, isLoadingMore, loadMorePosts } = usePosts()

  return (
    <div>
      {posts.map((post) => (
        <PostItem key={post.id} post={post} isCurrentUser={session?.user.id === post.authorId} />
      ))}
      {hasMore && (
        <Button onClick={loadMorePosts} isLoading={isLoadingMore}>
          Load More
        </Button>
      )}
    </div>
  )
}
