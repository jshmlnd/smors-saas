import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import authRoutes from './auth.routes.js'
import productRoutes from './product.routes.js'
import orderRoutes from './order.routes.js'
import serviceRoutes from './service.routes.js'
import uploadRoutes from './upload.routes.js'
import sessionRoutes from './session.routes.js'
import { dbReady } from '../config/db.js'
import { cloudinaryConfigured } from '../config/cloudinary.js'

const router = Router()

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts — try again later' }
})

router.get('/health', (_req, res) =>
  res.json({ ok: true, db: dbReady(), cloudinary: cloudinaryConfigured, uptime: process.uptime() })
)

router.use('/auth', authLimiter, authRoutes)
router.use('/products', productRoutes)
router.use('/orders', orderRoutes)
router.use('/service-requests', serviceRoutes)
router.use('/uploads', uploadRoutes)
router.use('/session', sessionRoutes)

export default router
