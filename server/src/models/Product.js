import mongoose from 'mongoose'

const { Schema } = mongoose

export const CATEGORIES = ['tees', 'shirts', 'shorts', 'pants', 'shoes', 'hoodies', 'jackets']
export const CONDITIONS = ['thrifted', 'pre-loved', 'like-new', 'brand-new']

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 140 },
    slug: { type: String, required: true, unique: true, index: true },
    brand: { type: String, trim: true, default: 'Unbranded' },
    category: { type: String, enum: CATEGORIES, required: true, index: true },
    condition: { type: String, enum: CONDITIONS, default: 'thrifted' },
    description: { type: String, trim: true, default: '' },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0, default: null },
    sizes: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    images: { type: [String], default: [] },
    stock: { type: Number, min: 0, default: 1 },
    featured: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'archived'], default: 'active', index: true }
  },
  { timestamps: true }
)

productSchema.index({ name: 'text', brand: 'text', tags: 'text' })

export default mongoose.model('Product', productSchema)
