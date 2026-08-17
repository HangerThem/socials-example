'use client'

import { useState, useContext, createContext, useMemo, useCallback } from 'react'
import { Post } from '@/type/Post.type'
import { triggerPostLike } from '@/server-actions/post'

type PostContextType = {
  post: Post
  toggleLike: () => Promise<void>
}

const PostContext = createContext<PostContextType | undefined>(undefined)

export const PostProvider = ({
  post: initialPost,
  children,
}: {
  post: Post
  children: React.ReactNode
}) => {
  const [post, setPost] = useState(initialPost)

  const toggleLike = useCallback(async () => {
    const originalState = post
    setPost((prev) => ({
      ...prev,
      liked: !prev.liked,
      _count: {
        ...prev._count,
        likes: !prev.liked ? prev._count.likes + 1 : prev._count.likes - 1,
      },
    }))
    try {
      await triggerPostLike(post.id)
    } catch (error) {
      setPost(originalState)
      console.error('Error liking post:', error)
    }
  }, [post])

  const value = useMemo(() => ({ post, toggleLike }), [post, toggleLike])

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>
}

export const usePost = () => {
  const context = useContext(PostContext)
  if (!context) {
    throw new Error('usePost must be used within a PostProvider')
  }
  return context
}
