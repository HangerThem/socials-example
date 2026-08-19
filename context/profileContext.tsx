'use client'

import { useState, useContext, createContext, useMemo, useCallback } from 'react'
import { triggerFollow } from '@/actions/user'
import type { User } from '@/types/User.type'

type ProfileContextType = {
  user: User
  toggleFollow: () => Promise<void>
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export const ProfileProvider = ({
  user: initialUser,
  children,
}: {
  user: User
  children: React.ReactNode
}) => {
  const [user, setUser] = useState(initialUser)

  const toggleFollow = useCallback(async () => {
    const originalUser = user
    setUser((prev) => ({
      ...prev,
      isFollowing: !originalUser.isFollowing,
      _count: {
        ...prev._count,
        followers: originalUser.isFollowing ? user._count.followers - 1 : user._count.followers + 1,
      },
    }))
    try {
      await triggerFollow(user.username)
    } catch (error) {
      setUser(user)
      console.error('Error following/unfollowing user:', error)
    }
  }, [user])

  const value = useMemo(() => ({ user, toggleFollow }), [user, toggleFollow])

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export const useProfile = () => {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}
