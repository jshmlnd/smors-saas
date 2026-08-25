import jwt from 'jsonwebtoken'
import AdminUser from '../models/AdminUser.js'
import { env } from '../config/env.js'
import { asyncHandler, httpError } from '../utils/helpers.js'

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) throw httpError(400, 'Email and password are required')

  const admin = await AdminUser.findOne({ email: String(email).toLowerCase().trim() })
  if (!admin || !admin.comparePassword(password)) throw httpError(401, 'Invalid credentials')

  const token = jwt.sign({ sub: admin._id.toString(), role: 'admin' }, env.JWT_SECRET, {
    expiresIn: '7d'
  })
  res.json({ token, admin: { email: admin.email, name: admin.name } })
})

export const me = asyncHandler(async (req, res) => {
  const admin = await AdminUser.findById(req.adminId).select('email name')
  if (!admin) throw httpError(404, 'Admin not found')
  res.json({ admin })
})
