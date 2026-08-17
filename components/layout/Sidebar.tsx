'use client'

import { signOut, useSession } from '@/lib/auth-client'
import { Home, LogOut, Settings, Search, User, PenSquare } from 'lucide-react'
import { Button } from '../ui/Button'
import { redirect } from 'next/navigation'
import { Avatar } from '../common/Avatar'

type NavigationItemBase = {
  name: string
  icon: React.ComponentType<{ size?: number }>
}

type NavigationItem = NavigationItemBase &
  ({ href: string; onClick?: never } | { href?: never; onClick: () => void })

const navigation: NavigationItem[] = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Profile', href: '/profile/{username}', icon: User },
  { name: 'Search', href: '/search', icon: Search },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Logout', onClick: () => signOut().then(() => redirect('/')), icon: LogOut },
]

export function Sidebar() {
  const { data: session } = useSession()

  return (
    <aside className="hidden lg:flex justify-end items-start flex-2 shrink-0 border-r border-border h-screen sticky top-0">
      {session && (
        <div className="flex flex-col justify-between items-end mx-8 my-12 gap-12">
          <Avatar username={session.user.name} src={session.user.image} size="lg" />

          <ul className="flex flex-col gap-4 mt-4 items-end">
            {navigation.map((item) => (
              <li key={item.name}>
                <Button
                  variant="ghost"
                  size="medium"
                  rounded="full"
                  {...('href' in item
                    ? { href: item.href?.replace('{username}', session.user.username || 'user') }
                    : { onClick: item.onClick })}
                >
                  <item.icon size={20} />
                  {item.name}
                </Button>
              </li>
            ))}
          </ul>

          <Button rounded="full" size="medium" align="center" className="mt-8" href="/create">
            <PenSquare className="mr-2" size={16} />
            Create Post
          </Button>
        </div>
      )}
    </aside>
  )
}
