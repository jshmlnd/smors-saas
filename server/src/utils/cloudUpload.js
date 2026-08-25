import { PassThrough } from 'node:stream'
import cloudinary from '../config/cloudinary.js'
import { httpError } from './helpers.js'

export function uploadBuffer(buffer, folder, publicId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, public_id: publicId, resource_type: 'image', overwrite: true },
      (err, result) => (err ? reject(err) : resolve(result))
    )
    const passthrough = new PassThrough()
    passthrough.end(buffer)
    passthrough.pipe(stream)
  })
}

export async function uploadFiles(files, folder) {
  if (!files?.length) throw httpError(400, 'No files uploaded')
  const results = await Promise.all(
    files.map((f, i) =>
      uploadBuffer(f.buffer, folder, `${Date.now()}-${i}-${Math.round(Math.random() * 1e6)}`)
    )
  )
  return results.map((r) => r.secure_url)
}
