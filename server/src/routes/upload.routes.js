import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { upload } from '../middleware/upload.js'
import { uploadAdminImages, uploadPublicImages, uploadStatus } from '../controllers/uploadController.js'
import { requireAdmin } from '../middleware/auth.js'

const publicLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many uploads — try again later' }
})

const router = Router()
router.get('/status', uploadStatus)
router.post('/admin', requireAdmin, upload.array('files', 8), uploadAdminImages)
router.post('/public', publicLimiter, upload.array('files', 4), uploadPublicImages)

export default router
