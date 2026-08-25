import { saveImages } from '../utils/storage.js'
import { asyncHandler, httpError } from '../utils/helpers.js'

const FOLDERS = {
  product: 'products',
  'payment-proof': 'payments',
  service: 'services'
}

const absolutize = (req, urls) =>
  urls.map((u) => (u.startsWith('http') ? u : `${req.protocol}://${req.get('host')}/uploads/${u}`))

export const uploadAdminImages = asyncHandler(async (req, res) => {
  const { urls } = await saveImages(req.files, FOLDERS.product)
  res.json({ urls: absolutize(req, urls) })
})

export const uploadPublicImages = asyncHandler(async (req, res) => {
  const kind = req.body.kind
  if (!(kind in FOLDERS) || kind === 'product') throw httpError(400, 'Invalid upload kind')
  if (req.files.length > 4) throw httpError(400, 'Max 4 images per submission')
  const { urls } = await saveImages(req.files, FOLDERS[kind])
  res.json({ urls: absolutize(req, urls) })
})

export const uploadStatus = asyncHandler(async (_req, res) => {
  const { cloudinaryConfigured } = await import('../config/cloudinary.js')
  res.json({ ok: true, mode: cloudinaryConfigured ? 'cloudinary' : 'local-disk' })
})
