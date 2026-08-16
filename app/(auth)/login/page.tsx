import { LoginForm } from '@/components/forms/LoginForm'

export default async function LoginPage({ searchParams }: PageProps<'/login'>) {
  const { callbackUrl } = await searchParams

  return <LoginForm callbackUrl={typeof callbackUrl === 'string' ? callbackUrl : undefined} />
}
