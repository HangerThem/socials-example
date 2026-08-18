'use client'

import { Input } from './Input'

type SearchProps = React.ComponentProps<typeof Input> & {
  onSearch: (query: string) => void
  children?: React.ReactNode
}

export const Search = ({ onSearch, children, ...props }: SearchProps) => {
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value)
  }

  return (
    <div className="relative w-full">
      <Input {...props} onChange={handleSearch} />
      {children && (
        <div className="absolute top-full left-0 w-full bg-background border border-border rounded mt-1 z-10">
          {children}
        </div>
      )}
    </div>
  )
}
