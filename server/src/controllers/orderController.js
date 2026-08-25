import Product from '../models/Product.js'
import Order, { ORDER_STATUSES, PAYMENT_METHODS, SHIPPING_METHODS } from '../models/Order.js'
import CustomerSession, { isValidSessionId } from '../models/CustomerSession.js'
import { asyncHandler, httpError } from '../utils/helpers.js'
import { generateRef } from '../utils/ids.js'
import { SHIPPING } from '../config/env.js'

export const createOrder = asyncHandler(async (req, res) => {
  const body = req.body || {}
  const items = Array.isArray(body.items) ? body.items : []

  if (!items.length) throw httpError(400, 'Cart is empty')
  if (!PAYMENT_METHODS.includes(body.paymentMethod)) throw httpError(400, 'Choose GCash, BDO or BPI')
  if (!SHIPPING_METHODS.includes(body.shippingMethod)) throw httpError(400, 'Choose a shipping method')
  if (!body.paymentProofUrl) {
    throw httpError(400, 'Proof of payment upload is required')
  }

  const ids = [...new Set(items.map((i) => i.productId).filter(Boolean))]
  const products = await Product.find({ _id: { $in: ids }, status: 'active' })
  const byId = new Map(products.map((p) => [p._id.toString(), p]))

  const lines = []
  for (const line of items) {
    const p = byId.get(String(line.productId))
    const qty = Math.max(1, Number(line.qty) || 1)
    if (!p) throw httpError(400, 'A product in your cart is no longer available')
    if (p.sizes.length > 0 && !p.sizes.includes(line.size)) throw httpError(400, `Pick a valid size for "${p.name}"`)
    if (p.stock < qty) throw httpError(409, `"${p.name}" only has ${p.stock} left`)
    lines.push({
      product: p._id,
      name: p.name,
      image: p.images[0] || '',
      size: line.size || '',
      price: p.price,
      qty
    })
  }

  const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0)
  const shippingFee =
    subtotal >= SHIPPING.FREE_THRESHOLD ? 0 : SHIPPING[body.shippingMethod]

  for (const l of lines) {
    await Product.findByIdAndUpdate(l.product, { $inc: { stock: -l.qty } })
  }

  let order
  try {
    order = await Order.create({
      refCode: generateRef('SMR'),
      items: lines,
      customer: body.customer,
      shippingMethod: body.shippingMethod,
      shippingFee,
      paymentMethod: body.paymentMethod,
      paymentProofUrl: body.paymentProofUrl || '',
      paymentRefNo: String(body.paymentRefNo || '').trim(),
      subtotal,
      total: subtotal + shippingFee,
      notes: String(body.notes || '').slice(0, 1000),
      status: 'payment_review',
      statusHistory: [{ status: 'payment_review', note: 'Order placed — proof submitted for review' }]
    })
  } catch (err) {
    for (const l of lines) {
      await Product.findByIdAndUpdate(l.product, { $inc: { stock: l.qty } })
    }
    throw err
  }

  res.status(201).json({ refCode: order.refCode, total: order.total })

  const sid = req.headers['x-session-id']
  if (isValidSessionId(sid)) {
    try {
      await CustomerSession.findByIdAndUpdate(
        sid,
        {
          $set: { expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) },
          $push: {
            orders: {
              $each: [{ ref: order.refCode, total: order.total, status: order.status, placedAt: order.createdAt }],
              $position: 0,
              $slice: 50
            }
          }
        },
        { upsert: true, setDefaultsOnInsert: true }
      )
    } catch {
      /* session tracking is best-effort — never fail the order */
    }
  }
})

export const getOrderByRef = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ refCode: req.params.ref.toUpperCase() })
    .populate('items.product', 'slug')
    .lean()
  if (!order) throw httpError(404, 'Order not found')
  res.json({ order })
})

export const listOrders = asyncHandler(async (req, res) => {
  const filter = {}
  if (req.query.status && ORDER_STATUSES.includes(req.query.status)) filter.status = req.query.status
  if (req.query.q) {
    const rx = new RegExp(String(req.query.q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    filter.$or = [{ refCode: rx }, { 'customer.name': rx }, { 'customer.phone': rx }]
  }
  const limit = Math.min(200, Number(req.query.limit) || 100)
  const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(limit).lean()
  res.json({ orders })
})

export const trackByRefs = asyncHandler(async (req, res) => {
  const raw = Array.isArray(req.body?.refs) ? req.body.refs : []
  const refs = [...new Set(raw.map((r) => String(r || '').toUpperCase().trim()).filter(Boolean))].slice(0, 50)
  if (!refs.length) return res.json({ orders: [] })
  const orders = await Order.find({ refCode: { $in: refs } })
    .select('refCode total status createdAt')
    .lean()
  res.json({ orders: orders.map((o) => ({ ref: o.refCode, total: o.total, status: o.status, placedAt: o.createdAt })) })
})

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body || {}
  if (!ORDER_STATUSES.includes(status)) throw httpError(400, 'Invalid status')

  const order = await Order.findById(req.params.id)
  if (!order) throw httpError(404, 'Order not found')

  if (status === 'cancelled' && !order.restocked && order.status !== 'cancelled') {
    for (const l of order.items) {
      await Product.findByIdAndUpdate(l.product, { $inc: { stock: l.qty } })
    }
    order.restocked = true
  }

  order.status = status
  order.statusHistory.push({ status, note: String(note || '') })
  await order.save()
  res.json({ order })
})
