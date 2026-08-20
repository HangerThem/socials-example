'use server'

import { getSession } from '@/helper/auth'
import { prisma } from '@/lib/prisma'
import supabase from '@/lib/supabase'

type UploadFileRequest = {
  name: string
  mimetype: string
  size: number
  alt?: string | null
}

type UploadFileResponse = {
  signedUrl: string
  token: string
  fileId: string
}

export async function uploadFile({
  name,
  mimetype,
  size,
  alt,
}: UploadFileRequest): Promise<UploadFileResponse> {
  const session = await getSession()

  if (!session) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase.storage
    .from('uploads')
    .createSignedUploadUrl(`${session.user.username}/${name}`)

  if (error) {
    throw new Error(`Failed to create signed upload URL: ${error.message}`)
  }

  const { signedUrl, token, path } = data

  const file = await prisma.file.create({
    data: {
      name,
      mimetype,
      size,
      path,
      alt,
      authorId: session.user.id,
    },
  })

  return { signedUrl, token, fileId: file.id }
}

export async function batchUploadFiles(files: UploadFileRequest[]): Promise<UploadFileResponse[]> {
  const session = await getSession()

  if (!session) {
    throw new Error('User not authenticated')
  }

  const uploadPromises = files.map(async (file) => {
    const { name, mimetype, size, alt } = file

    const { data, error } = await supabase.storage
      .from('uploads')
      .createSignedUploadUrl(`${session.user.username}/${name}`)

    if (error) {
      throw new Error(`Failed to create signed upload URL for ${name}: ${error.message}`)
    }

    const { signedUrl, token, path } = data

    const createdFile = await prisma.file.create({
      data: {
        name,
        mimetype,
        size,
        path,
        alt,
        authorId: session.user.id,
      },
    })

    return { signedUrl, token, fileId: createdFile.id }
  })

  return Promise.all(uploadPromises)
}

export async function deleteFile(fileId: string): Promise<{ success: boolean }> {
  const session = await getSession()

  if (!session) {
    throw new Error('User not authenticated')
  }

  const file = await prisma.file.findUnique({
    where: { id: fileId },
  })

  if (!file) {
    throw new Error('File not found')
  }

  if (file.authorId !== session.user.id) {
    throw new Error('User not authorized to delete this file')
  }

  const { error } = await supabase.storage.from('uploads').remove([file.path])

  if (error) {
    throw new Error(`Failed to delete file from storage: ${error.message}`)
  }

  await prisma.file.delete({
    where: { id: fileId },
  })

  return { success: true }
}

export async function batchDeleteFiles(fileIds: string[]): Promise<{ success: boolean }> {
  const session = await getSession()

  if (!session) {
    throw new Error('User not authenticated')
  }

  const files = await prisma.file.findMany({
    where: { id: { in: fileIds } },
  })

  const unauthorizedFiles = files.filter((file) => file.authorId !== session.user.id)

  if (unauthorizedFiles.length > 0) {
    throw new Error('User not authorized to delete some of the files')
  }

  const pathsToDelete = files.map((file) => file.path)

  const { error } = await supabase.storage.from('uploads').remove(pathsToDelete)

  if (error) {
    throw new Error(`Failed to delete files from storage: ${error.message}`)
  }

  await prisma.file.deleteMany({
    where: { id: { in: fileIds } },
  })

  return { success: true }
}
