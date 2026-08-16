'use client'

import { signOut, useSession } from '@/lib/auth-client'
import Link from 'next/link'
import { LogOut, Settings, Search, User, PenSquare } from 'lucide-react'
import { Button } from '../ui/Button'
import { redirect } from 'next/navigation'
import Image from 'next/image'

type NavigationItemBase = {
  name: string
  icon: React.ComponentType<{ size?: number }>
}

type NavigationItem = NavigationItemBase &
  ({ href: string; onClick?: never } | { href?: never; onClick: () => void })

const navigation: NavigationItem[] = [
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Search', href: '/search', icon: Search },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Logout', onClick: () => signOut().then(() => redirect('/')), icon: LogOut },
]

export function Sidebar() {
  const { data: session } = useSession()

  if (!session) {
    return null
  }

  return (
    <aside className="hidden lg:flex justify-end items-start flex-2 shrink-0 border-r border-border h-screen sticky top-0">
      <div className="flex flex-col justify-between items-end mx-8 my-12 gap-12">
        <div className="group flex items-center gap-2">
          <div className="w-12 h-12 relative rounded-full overflow-hidden bg-foreground">
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || 'User Avatar'}
                className="object-cover"
                fill
              />
            ) : (
              <span className="text-xl font-bold flex items-center justify-center w-full h-full">
                {session.user.name?.[0] || 'U'}
              </span>
            )}
          </div>
        </div>

        <ul className="flex flex-col gap-4 mt-4 items-end">
          {navigation.map((item) => (
            <li key={item.name}>
              {item.onClick ? (
                <button
                  onClick={item.onClick}
                  className="text-xl flex items-center gap-2 cursor-pointer hover:bg-foreground transition-colors px-3 py-1 rounded-full"
                >
                  <item.icon size={20} />
                  {item.name}
                </button>
              ) : (
                <Link
                  href={item.href}
                  className="text-xl flex items-center gap-2 hover:bg-foreground transition-colors px-3 py-1 rounded-full"
                >
                  <item.icon size={20} />
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ul>

        <Button
          variant="primary"
          size="medium"
          align="center"
          className="mt-8"
          onClick={() => {
            redirect('/create')
          }}
        >
          <PenSquare className="mr-2" size={16} />
          Create Post
        </Button>
      </div>
    </aside>
  )
}
