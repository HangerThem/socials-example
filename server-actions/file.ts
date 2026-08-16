'use server'

import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? './public/uploads'

export async function uploadFile(formData: FormData) {
  const file = formData.get('avatar') as File | null
  if (!file || file.size === 0) return { error: 'No file provided' }

  if (!file.type.startsWith('image/')) {
    return { error: 'File must be an image' }
  }
  if (file.size > 5 * 1024 * 1024) {
    return { error: 'File must be under 5MB' }
  }

  const ext = path.extname(file.name) || guessExt(file.type)
  const filename = `${crypto.randomUUID()}${ext}`

  await mkdir(UPLOAD_DIR, { recursive: true })

  const arrayBuffer = await file.arrayBuffer()
  await writeFile(path.join(UPLOAD_DIR, filename), Buffer.from(arrayBuffer))

  const url = `/uploads/${filename}`

  const uploadedFile = await prisma.file.create({
    data: {
      url,
    },
  })

  return uploadedFile
}

function guessExt(mimeType: string) {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
  }
  return map[mimeType] ?? ''
}

export async function getImageUrl(session: any) {
  if (!session?.user?.image) return null

  const file = await prisma.file.findUnique({
    where: { id: session.user.image },
  })

  return file?.url ?? null
}