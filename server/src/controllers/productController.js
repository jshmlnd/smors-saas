import Product, { CATEGORIES, CONDITIONS } from '../models/Product.js'
import { asyncHandler, httpError } from '../utils/helpers.js'
import { slugify } from '../utils/ids.js'

const SORTS = {
  newest: { createdAt: -1 },
  'price-asc': { price: 1 },
  'price-desc': { price: -1 },
  'name-asc': { name: 1 }
}

const cleanTags = (tags) =>
  Array.isArray(tags)
    ? tags.flatMap((t) => String(t).toLowerCase().split(/[,\s]+/)).filter(Boolean).slice(0, 20)
    : []

const cleanImages = (images) =>
  Array.isArray(images)
    ? images.map((u) => String(u).trim()).filter((u) => /^https?:\/\//.test(u)).slice(0, 10)
    : []

export const listProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1)
  const limit = Math.min(48, Math.max(1, Number(req.query.limit) || 10))
  const filter = {}

  if (req.query.includeArchived !== 'true') filter.status = 'active'
  if (req.query.category && CATEGORIES.includes(req.query.category)) filter.category = req.query.category
  if (req.query.featured === 'true') filter.featured = true
  if (req.query.condition && CONDITIONS.includes(req.query.condition)) filter.condition = req.query.condition
  if (req.query.maxPrice) filter.price = { ...(filter.price || {}), $lte: Number(req.query.maxPrice) }
  if (req.query.minPrice) filter.price = { ...(filter.price || {}), $gte: Number(req.query.minPrice) }
  if (req.query.inStock === 'true') filter.stock = { $gt: 0 }
  if (req.query.q) {
    const rx = new RegExp(String(req.query.q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    filter.$or = [{ name: rx }, { brand: rx }, { tags: rx }, { description: rx }]
  }

  const sort = SORTS[req.query.sort] || SORTS.newest
  const [items, total] = await Promise.all([
    Product.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
    Product.countDocuments(filter)
  ])

  res.json({ items, total, page, pages: Math.ceil(total / limit) || 1 })
})

export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug }).lean()
  if (!product || product.status !== 'active') throw httpError(404, 'Product not found')
  res.json({ product })
})

export const getCategoryCounts = asyncHandler(async (_req, res) => {
  const counts = await Product.aggregate([
    { $match: { status: 'active' } },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ])
  res.json({ counts })
})

export const createProduct = asyncHandler(async (req, res) => {
  const body = req.body || {}
  if (!body.name || body.price == null || !CATEGORIES.includes(body.category)) {
    throw httpError(400, 'Name, price and a valid category are required')
  }
  let slug = slugify(body.slug || body.name)
  if (await Product.exists({ slug })) slug = `${slug}-${Date.now().toString(36)}`
  const product = await Product.create({
    ...body,
    name: body.name,
    slug,
    tags: cleanTags(body.tags),
    images: cleanImages(body.images),
    sizes: Array.isArray(body.sizes) ? body.sizes.map(String) : []
  })
  res.status(201).json({ product })
})

export const updateProduct = asyncHandler(async (req, res) => {
  const updates = { ...req.body }
  delete updates.slug
  delete updates._id
  if ('tags' in updates) updates.tags = cleanTags(updates.tags)
  if ('images' in updates) updates.images = cleanImages(updates.images)
  if ('sizes' in updates) updates.sizes = Array.isArray(updates.sizes) ? updates.sizes.map(String) : []
  const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
  if (!product) throw httpError(404, 'Product not found')
  res.json({ product })
})

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id)
  if (!product) throw httpError(404, 'Product not found')
  res.json({ ok: true })
})
