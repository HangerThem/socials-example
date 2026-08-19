'use client'

import { useState, useContext, createContext, useMemo, useCallback } from 'react'
import { Post } from '@/types/Post.type'
import { triggerPostLike } from '@/actions/post'
import {
  createComment,
  triggerCommentLike,
  deleteComment as deleteCommentAction,
} from '@/actions/comment'
import { Comment } from '@/types/Comment.type'

type PostContextType = {
  post: Post
  comments: Comment[]
  toggleLike: () => Promise<void>
  toggleCommentLike: (commentId: string) => Promise<void>
  postComment: (content: string) => Promise<void>
  deleteComment: (commentId: string) => Promise<void>
}

const PostContext = createContext<PostContextType | undefined>(undefined)

export const PostProvider = ({
  post: initialPost,
  comments: initialComments,
  children,
}: {
  post: Post
  comments: Comment[]
  children: React.ReactNode
}) => {
  const [post, setPost] = useState(initialPost)
  const [comments, setComments] = useState(initialComments)

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

  const toggleCommentLike = useCallback(
    async (commentId: string) => {
      const originalState = comments

      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? {
                ...c,
                liked: !c.liked,
                _count: {
                  ...c._count,
                  commentLikes: !c.liked ? c._count.commentLikes + 1 : c._count.commentLikes - 1,
                },
              }
            : c,
        ),
      )

      try {
        await triggerCommentLike(commentId)
      } catch (error) {
        setComments(originalState)
        console.error('Error liking post:', error)
      }
    },
    [comments],
  )

  const postComment = useCallback(
    async (content: string) => {
      const originalState = post
      if (!originalState) return

      setPost((prev) => ({
        ...prev,
        _count: { ...prev._count, comments: prev._count.comments + 1 },
      }))

      try {
        const comment = await createComment(post.id, content)
        setComments((prev) => [...prev, comment])
      } catch (error) {
        setPost(originalState)
        console.error('Error posting comment:', error)
      }
    },
    [post],
  )

  const deleteComment = useCallback(
    async (commentId: string) => {
      const originalState = comments
      setComments((prev) => prev.filter((c) => c.id !== commentId))
      try {
        await deleteCommentAction(commentId)
      } catch (error) {
        setComments(originalState)
        console.error('Error deleting comment:', error)
      }
    },
    [comments],
  )

  const value = useMemo(
    () => ({ post, comments, toggleLike, toggleCommentLike, postComment, deleteComment }),
    [post, comments, toggleLike, toggleCommentLike, postComment, deleteComment],
  )

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>
}

export const usePost = () => {
  const context = useContext(PostContext)
  if (!context) {
    throw new Error('usePost must be used within a PostProvider')
  }
  return context
}
