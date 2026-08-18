'use client'

import { Avatar } from '@/components/common/Avatar'
import { Search } from '@/components/ui/Search'
import { searchUsers } from '@/server-actions/user'
import { User } from '@/type/User.type'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<User[]>([])

  const handleSearch = useCallback(async () => {
    if (!query) {
      setResults([])
      return
    }
    const users = await searchUsers(query)
    if (!users) {
      setResults([])
      return
    }
    setResults(users)
  }, [query])

  useEffect(() => {
    handleSearch()
  }, [query, handleSearch])

  return (
    <div className="flex flex-col justify-center w-full p-2">
      <Search placeholder="Search users..." value={query} onSearch={(q) => setQuery(q)}>
        {results.length > 0 &&
          results.map((user) => (
            <Link
              href={`/profile/${user.username}`}
              key={user.username}
              className="flex items-center gap-2 p-2 hover:bg-accent rounded"
            >
              <Avatar username={user.username} src={user.image} size="sm" />
              <span>{user.displayUsername || user.username}</span>
            </Link>
          ))}
      </Search>
      <div>Hello</div>
    </div>
  )
}
