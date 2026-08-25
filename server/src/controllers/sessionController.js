import CustomerSession, { sessionExpiry, isValidSessionId } from '../models/CustomerSession.js'
import { asyncHandler, httpError } from '../utils/helpers.js'

const MAX_CART_ITEMS = 100
const MAX_WISHLIST_ITEMS = 200
const MAX_ORDER_REFS = 50

function assertSessionId(id) {
  if (!isValidSessionId(id)) throw httpError(400, 'Invalid session id')
}

const str = (v, max) => String(v ?? '').slice(0, max)

function sanitizeCart(items) {
  if (!Array.isArray(items)) return []
  return items.slice(0, MAX_CART_ITEMS).map((i) => ({
    key: str(i?.key, 80),
    productId: str(i?.productId, 64),
    slug: str(i?.slug, 160),
    name: str(i?.name, 140),
    brand: str(i?.brand, 140),
    image: str(i?.image, 500),
    price: Math.max(0, Number(i?.price) || 0),
    size: str(i?.size, 20),
    stock: Math.max(0, Math.round(Number(i?.stock) || 0)),
    qty: Math.min(999, Math.max(1, Math.round(Number(i?.qty) || 1)))
  }))
}

function sanitizeWishlist(ids) {
  if (!Array.isArray(ids)) return []
  const seen = new Set()
  for (const id of ids) {
    const s = str(id, 64)
    if (s && !seen.has(s) && seen.size < MAX_WISHLIST_ITEMS) seen.add(s)
  }
  return [...seen]
}

function sanitizeOrders(orders) {
  if (!Array.isArray(orders)) return []
  const byRef = new Map()
  for (const o of orders) {
    if (byRef.size >= MAX_ORDER_REFS) break
    const ref = str(o?.ref, 32).toUpperCase()
    if (!ref || byRef.has(ref)) continue
    byRef.set(ref, {
      ref,
      total: Math.max(0, Number(o?.total) || 0),
      status: str(o?.status, 30) || 'payment_review',
      placedAt: o?.placedAt && !Number.isNaN(Date.parse(o.placedAt)) ? new Date(o.placedAt) : new Date()
    })
  }
  return [...byRef.values()]
}

export const getSession = asyncHandler(async (req, res) => {
  const sid = req.params.sid
  assertSessionId(sid)
  const session = await CustomerSession.findById(sid).lean()
  res.json({
    sessionId: sid,
    cart: session?.cart || [],
    wishlist: session?.wishlist || [],
    orders: session?.orders || []
  })
})

export const saveSession = asyncHandler(async (req, res) => {
  const sid = req.params.sid
  assertSessionId(sid)
  const body = req.body || {}
  await CustomerSession.findByIdAndUpdate(
    sid,
    {
      $set: {
        cart: sanitizeCart(body.cart),
        wishlist: sanitizeWishlist(body.wishlist),
        orders: sanitizeOrders(body.orders),
        expiresAt: sessionExpiry()
      }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )
  res.json({ ok: true, savedAt: new Date().toISOString() })
})
