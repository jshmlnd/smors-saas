import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { cloudinaryConfigured } from '../config/cloudinary.js'
import { uploadFiles as cloudinaryUpload } from './cloudUpload.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const uploadsRoot = path.resolve(__dirname, '../../uploads')

const EXT = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif'
}

export async function saveImages(files, folder) {
  if (cloudinaryConfigured) {
    const urls = await cloudinaryUpload(files, `smors/${folder}`)
    return { urls, mode: 'cloudinary' }
  }

  const dir = path.join(uploadsRoot, folder)
  await fs.mkdir(dir, { recursive: true })
  const names = []
  for (const [i, file] of files.entries()) {
    const name = `${Date.now()}-${i}-${crypto.randomBytes(4).toString('hex')}${EXT[file.mimetype] || '.jpg'}`
    await fs.writeFile(path.join(dir, name), file.buffer)
    names.push(`${folder}/${name}`)
  }
  return { urls: names, mode: 'local' }
}
