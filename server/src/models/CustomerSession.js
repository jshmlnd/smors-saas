import mongoose from 'mongoose'

const { Schema } = mongoose

export const SESSION_TTL_DAYS = 180
const SESSION_ID_RE = /^[A-Za-z0-9_-]{8,64}$/

export function isValidSessionId(id) {
  return SESSION_ID_RE.test(String(id || ''))
}

const itemSchema = new Schema(
  {
    key: { type: String, required: true },
    productId: { type: String, default: '' },
    slug: { type: String, default: '' },
    name: { type: String, default: '' },
    brand: { type: String, default: '' },
    image: { type: String, default: '' },
    price: { type: Number, default: 0 },
    size: { type: String, default: '' },
    stock: { type: Number, default: 0 },
    qty: { type: Number, default: 1 }
  },
  { _id: false }
)

const orderRefSchema = new Schema(
  {
    ref: { type: String, required: true },
    total: { type: Number, default: 0 },
    status: { type: String, default: 'payment_review' },
    placedAt: { type: Date, default: Date.now }
  },
  { _id: false }
)

const customerSessionSchema = new Schema(
  {
    _id: { type: String, required: true },
    cart: { type: [itemSchema], default: [] },
    wishlist: { type: [String], default: [] },
    orders: { type: [orderRefSchema], default: [] },
    expiresAt: { type: Date, required: true }
  },
  { timestamps: true, versionKey: false }
)

customerSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const CustomerSession =
  mongoose.models.CustomerSession || mongoose.model('CustomerSession', customerSessionSchema)

export function sessionExpiry() {
  return new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000)
}

export default CustomerSession
