import mongoose from 'mongoose'

const { Schema } = mongoose

export const SERVICE_TYPES = [
  'cap_restoration',
  'cap_custom',
  'shoe_restoration',
  'shoe_custom',
  'other'
]

export const REQUEST_STATUSES = ['received', 'quoting', 'in_progress', 'ready', 'completed', 'declined']

const serviceRequestSchema = new Schema(
  {
    refCode: { type: String, required: true, unique: true, index: true },
    type: { type: String, enum: SERVICE_TYPES, required: true },
    name: { type: String, required: true, trim: true },
    contact: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    budget: { type: String, trim: true, default: '' },
    images: { type: [String], default: [] },
    adminNote: { type: String, trim: true, default: '' },
    status: { type: String, enum: REQUEST_STATUSES, default: 'received', index: true }
  },
  { timestamps: true }
)

export default mongoose.model('ServiceRequest', serviceRequestSchema)
