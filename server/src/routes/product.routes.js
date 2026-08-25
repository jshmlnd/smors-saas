import { Router } from 'express'
import {
  listProducts,
  getProductBySlug,
  getCategoryCounts,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()

router.get('/', listProducts)
router.get('/meta/categories', getCategoryCounts)
router.get('/slug/:slug', getProductBySlug)
router.post('/', requireAdmin, createProduct)
router.put('/:id', requireAdmin, updateProduct)
router.delete('/:id', requireAdmin, deleteProduct)

export default router
