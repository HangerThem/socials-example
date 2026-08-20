import { getUserByUsername } from '@/actions/user'
import { ProfileProvider } from '@/context/profileContext'
import { PostsProvider } from '@/context/postsContext'
import { getPosts } from '@/actions/post'
import { ProfileHeader } from '@/components/layout/ProfileHeader'

export default async function ProfileLayout({
  params,
  children,
}: LayoutProps<'/profile/[username]'>) {
  const { username } = await params
  const user = await getUserByUsername(username)
  const posts = await getPosts({ username })

  if (!user) {
    return null
  }

  return (
    <PostsProvider posts={posts} username={username}>
      <ProfileProvider user={user}>
        <ProfileHeader />
        {children}
      </ProfileProvider>
    </PostsProvider>
  )
}
