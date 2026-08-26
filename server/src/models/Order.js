import mongoose from 'mongoose'

const { Schema } = mongoose

export const ORDER_STATUSES = [
  'payment_review',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled'
]
export const PAYMENT_METHODS = ['gcash', 'bdo', 'bpi']
export const SHIPPING_METHODS = ['jt', 'door2door']

const orderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    image: String,
    size: String,
    price: Number,
    qty: { type: Number, min: 1 }
  },
  { _id: false }
)

const orderSchema = new Schema(
  {
    refCode: { type: String, required: true, unique: true, index: true },
    items: {
      type: [orderItemSchema],
      validate: [(v) => v.length > 0, 'Order needs at least one item']
    },
    customer: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      email: { type: String, trim: true, default: '' },
      messenger: { type: String, trim: true, default: '' },
      address: {
        line: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        province: { type: String, required: true, trim: true },
        postal: { type: String, trim: true, default: '' }
      }
    },
    shippingMethod: { type: String, enum: SHIPPING_METHODS, required: true },
    shippingFee: { type: Number, required: true, min: 0 },
    trackingNumber: { type: String, trim: true, default: '' },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
    paymentProofUrl: { type: String, default: '' },
    paymentRefNo: { type: String, trim: true, default: '' },
    subtotal: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    notes: { type: String, trim: true, default: '' },
    status: { type: String, enum: ORDER_STATUSES, default: 'payment_review', index: true },
    restocked: { type: Boolean, default: false },
    statusHistory: [
      {
        status: String,
        at: { type: Date, default: Date.now },
        note: { type: String, default: '' }
      }
    ]
  },
  { timestamps: true }
)

export default mongoose.model('Order', orderSchema)
