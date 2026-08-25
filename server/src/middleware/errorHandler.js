import { httpError } from '../utils/helpers.js'

export function notFound(req, res, next) {
  next(httpError(404, 'Not found'))
}

export function errorHandler(err, req, res, next) {
  let status = err.status || 500
  let message = err.message || 'Something went wrong'

  if (err.name === 'ValidationError') {
    status = 400
    message = Object.values(err.errors).map((e) => e.message).join(', ')
  }
  if (err.code === 11000) {
    status = 409
    message = 'Duplicate value: ' + Object.keys(err.keyValue || {}).join(', ')
  }
  if (err.name === 'MulterError') {
    status = 400
    message = err.code === 'LIMIT_FILE_SIZE' ? 'File too large (max 5MB)' : err.message
  }

  if (status >= 500 && !err.expose) console.error('[SMORS ERROR]', err)
  res.status(status).json({ message })
}
