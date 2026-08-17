'use server'

import { prisma } from '@/lib/prisma'
import { writeFile, mkdir, rm } from 'fs/promises'
import path from 'path'

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? './public/uploads'

export async function uploadFile(formData: FormData) {
  const file = formData.get('avatar') as File | null
  const alt = formData.get('alt') as string | null
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
      alt,
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

export async function batchUploadFiles(formData: FormData) {
  const files = formData.getAll('files') as File[]
  const alts = formData.getAll('alts') as string[]

  if (files.length === 0) return { error: 'No files provided' }

  const uploadPromises = files.map((file, index) => {
    const alt = alts[index] ?? null
    const singleFormData = new FormData()
    singleFormData.append('avatar', file)
    if (alt) singleFormData.append('alt', alt)
    return uploadFile(singleFormData)
  })

  return Promise.all(uploadPromises)
}

export async function deleteFile(fileId: string) {
  const file = await prisma.file.findUnique({
    where: { id: fileId },
  })

  if (!file) {
    return { error: 'File not found' }
  }

  const filePath = path.join(UPLOAD_DIR, path.basename(file.url))
  try {
    await prisma.file.delete({
      where: { id: fileId },
    })
    await rm(filePath)
    return { success: true }
    // oxlint-disable-next-line typescript/no-explicit-any
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function batchDeleteFiles(fileIds: string[]) {
  if (fileIds.length === 0) return { error: 'No file IDs provided' }

  const deletePromises = fileIds.map((fileId) => {
    return deleteFile(fileId)
  })

  return Promise.all(deletePromises)
}
