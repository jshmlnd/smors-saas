import ServiceRequest, { SERVICE_TYPES } from '../models/ServiceRequest.js'
import { REQUEST_STATUSES } from '../models/ServiceRequest.js'
import { asyncHandler, httpError } from '../utils/helpers.js'
import { generateRef } from '../utils/ids.js'

export const createServiceRequest = asyncHandler(async (req, res) => {
  const body = req.body || {}
  if (!SERVICE_TYPES.includes(body.type)) throw httpError(400, 'Pick a service type')
  if (!body.name?.trim()) throw httpError(400, 'Name is required')
  if (!body.contact?.trim()) throw httpError(400, 'Contact (FB link or mobile) is required')
  if (!body.description?.trim()) throw httpError(400, 'Tell us about your piece')

  const request = await ServiceRequest.create({
    refCode: generateRef('SRC'),
    type: body.type,
    name: body.name.trim().slice(0, 120),
    contact: body.contact.trim().slice(0, 200),
    description: body.description.trim().slice(0, 2000),
    budget: String(body.budget || '').slice(0, 60),
    images: Array.isArray(body.images) ? body.images.filter((u) => /^https?:\/\//.test(u)).slice(0, 4) : []
  })

  res.status(201).json({ refCode: request.refCode })
})

export const listServiceRequests = asyncHandler(async (req, res) => {
  const filter = {}
  if (req.query.status && REQUEST_STATUSES.includes(req.query.status)) filter.status = req.query.status
  const requests = await ServiceRequest.find(filter).sort({ createdAt: -1 }).limit(150).lean()
  res.json({ requests })
})

export const updateServiceRequest = asyncHandler(async (req, res) => {
  const { status, adminNote } = req.body || {}
  const updates = {}
  if (status && REQUEST_STATUSES.includes(status)) updates.status = status
  if (typeof adminNote === 'string') updates.adminNote = adminNote.slice(0, 500)

  const request = await ServiceRequest.findByIdAndUpdate(req.params.id, updates, { new: true })
  if (!request) throw httpError(404, 'Request not found')
  res.json({ request })
})
