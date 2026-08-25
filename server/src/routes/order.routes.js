import { Router } from 'express'
import {
  createOrder,
  getOrderByRef,
  listOrders,
  trackByRefs,
  updateOrderStatus
} from '../controllers/orderController.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()

router.post('/', createOrder)
router.post('/track', trackByRefs)
router.get('/ref/:ref', getOrderByRef)
router.get('/', requireAdmin, listOrders)
router.put('/:id/status', requireAdmin, updateOrderStatus)

export default router
