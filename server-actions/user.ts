'use server'

import { prisma } from '@/lib/prisma'

export async function usernameIsUnique(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
  })
  return !user
}

export async function emailIsUnique(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  })
  return !user
}
