import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search | @handle',
  description: 'Search for users on the platform',
}

export default function SearchLayout({ children }: LayoutProps<'/search'>) {
  return children
}
