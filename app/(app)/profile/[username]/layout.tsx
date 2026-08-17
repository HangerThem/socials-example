import { getUserByUsername } from '@/server-actions/user'
import { ProfileProvider } from '@/context/profileContext'

export default async function ProfileLayout({
  params,
  children,
}: LayoutProps<'/profile/[username]'>) {
  const { username } = await params
  const user = await getUserByUsername(username)

  if (!user) {
    return null
  }

  return <ProfileProvider user={user}>{children}</ProfileProvider>
}
