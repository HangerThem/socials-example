import { batchUploadFiles, uploadFile } from '@/actions/file'

export async function handleUpload(file: File, alt?: string | null) {
  const { signedUrl, fileId } = await uploadFile({
    name: file.name,
    mimetype: file.type,
    size: file.size,
    alt,
  })

  const response = await fetch(signedUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  })

  if (!response.ok) {
    throw new Error(`Failed to upload file: ${response.statusText}`)
  }

  return { success: true, fileId }
}

export async function handleBatchUpload(files: { file: File; alt?: string | null }[]) {
  const fileArray = files.map((f) => ({
    name: f.file.name,
    mimetype: f.file.type,
    size: f.file.size,
    alt: f.alt,
  }))

  const uploads = await batchUploadFiles(fileArray)

  const uploadPromises = uploads.map(({ signedUrl, fileId }, index) => {
    const { file } = files[index]

    return fetch(signedUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    }).then((response) => ({
      success: response.ok,
      fileId,
    }))
  })

  const results = await Promise.all(uploadPromises)

  const successful = results.filter((r) => r.success).length

  if (successful !== files.length) {
    throw new Error(`Failed to upload ${files.length - successful} files.`)
  }

  return results
}
