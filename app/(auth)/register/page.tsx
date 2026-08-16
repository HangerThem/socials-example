import { RegisterForm } from '@/components/forms/RegisterForm'

export default async function RegisterPage({ searchParams }: PageProps<'/register'>) {
  const { callbackUrl } = await searchParams

  return <RegisterForm callbackUrl={typeof callbackUrl === 'string' ? callbackUrl : undefined} />
}
