'use client'

import { useState, useContext, createContext, useMemo, useCallback } from 'react'
import { PostSimple } from '@/type/Post.type'
import { getPosts } from '@/actions/post'
import { postPagination } from '@/const/pagination'
import { createComment } from '@/actions/comment'

type PostsContextType = {
  posts: PostSimple[]
  hasMore: boolean
  isLoadingMore: boolean
  loadMorePosts: () => Promise<void>
  postComment: (postId: string, content: string) => Promise<void>
}

const PostsContext = createContext<PostsContextType | undefined>(undefined)

export const PostsProvider = ({
  posts: initialPosts,
  username,
  children,
}: {
  posts: PostSimple[]
  username?: string
  children: React.ReactNode
}) => {
  const [posts, setPosts] = useState(initialPosts)
  const [hasMore, setHasMore] = useState(initialPosts.length === postPagination)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const loadMorePosts = useCallback(async () => {
    if (isLoadingMore || !hasMore) return
    setIsLoadingMore(true)

    const lastPostId = posts[posts.length - 1].id
    try {
      const newPosts = await getPosts({ lastPostId, username })
      setPosts((prev) => [...prev, ...newPosts])
      if (newPosts.length < postPagination) setHasMore(false)
    } catch (error) {
      console.error('Error loading more posts:', error)
    }
    setIsLoadingMore(false)
  }, [posts, isLoadingMore, hasMore, username])

  const postComment = useCallback(
    async (postId: string, content: string) => {
      const originalPost = posts.find((p) => p.id === postId)
      if (!originalPost) return

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, _count: { ...p._count, comments: p._count.comments + 1 } } : p,
        ),
      )

      try {
        await createComment(postId, content)
      } catch (error) {
        setPosts((prev) => prev.map((p) => (p.id === postId ? originalPost : p)))
        console.error('Error posting comment:', error)
      }
    },
    [posts],
  )

  const value = useMemo(
    () => ({ posts, hasMore, isLoadingMore, loadMorePosts, postComment }),
    [posts, hasMore, isLoadingMore, loadMorePosts, postComment],
  )

  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>
}

export const usePosts = () => {
  const context = useContext(PostsContext)
  if (!context) {
    throw new Error('usePosts must be used within a PostsProvider')
  }
  return context
}
