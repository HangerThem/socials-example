'use client'

import { usePosts } from '@/context/postsContext'
import { PostItem } from './common/PostItem'
import { useSession } from '@/helper/auth-client'
import { Button } from './ui/Button'
import { Suspense, useMemo } from 'react'
import { renderMessageContent } from '@/utils/text'

export function PostsList() {
  const { data: session } = useSession()
  const { posts, hasMore, isLoadingMore, loadMorePosts } = usePosts()

  const postsWithPromises = useMemo(
    () =>
      posts.map((post) => ({
        ...post,
        contentPromise: renderMessageContent(post.content),
      })),
    [posts],
  )

  return (
    <div>
      {postsWithPromises.map((post) => {
        return (
          <Suspense key={post.id} fallback={<div>Loading post...</div>}>
            <PostItem
              post={post}
              contentPromise={post.contentPromise}
              isCurrentUser={session?.user.id === post.authorId}
            />
          </Suspense>
        )
      })}
      {hasMore && (
        <Button onClick={loadMorePosts} isLoading={isLoadingMore}>
          Load More
        </Button>
      )}
    </div>
  )
}
