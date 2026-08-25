import { Router } from 'express'
import {
  createServiceRequest,
  listServiceRequests,
  updateServiceRequest
} from '../controllers/serviceRequestController.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()

router.post('/', createServiceRequest)
router.get('/', requireAdmin, listServiceRequests)
router.put('/:id', requireAdmin, updateServiceRequest)

export default router
