import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import apiRoutes from './routes/index.js'
import { env, isProd } from './config/env.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

app.set('trust proxy', 1)
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(
  cors(
    env.CLIENT_ORIGINS.length
      ? { origin: env.CLIENT_ORIGINS }
      : { origin: true }
  )
)
app.use(compression())
app.use(express.json({ limit: '1mb' }))
app.use(
  '/uploads',
  express.static(path.resolve(__dirname, '../uploads'), { maxAge: '30d', immutable: true })
)
if (isProd()) app.use(morgan('combined'))
else app.use(morgan('dev'))

app.use('/api', rateLimit({ windowMs: 60 * 1000, limit: 240, standardHeaders: true, legacyHeaders: false }), apiRoutes)

if (isProd()) {
  const dist = path.resolve(__dirname, '../../client/dist')
  if (fs.existsSync(dist)) {
    app.use(express.static(dist))
    app.use((req, res, next) => {
      if (req.method !== 'GET' || req.path.startsWith('/api')) return next()
      res.sendFile(path.join(dist, 'index.html'))
    })
  }
}

app.use(notFound)
app.use(errorHandler)

export default app
