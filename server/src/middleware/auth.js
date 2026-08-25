import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { httpError } from '../utils/helpers.js'

export function requireAdmin(req, res, next) {
  const header = req.headers.authorization || ''
  if (!header.startsWith('Bearer ')) return next(httpError(401, 'Unauthorized'))
  try {
    const payload = jwt.verify(header.slice(7), env.JWT_SECRET)
    req.adminId = payload.sub
    next()
  } catch (err) {
    err.status = 401
    err.expired = err.name === 'TokenExpiredError'
    next(err)
  }
}
