import { Router } from 'express'
import { getSession, saveSession } from '../controllers/sessionController.js'

const router = Router()

router.get('/:sid', getSession)
router.put('/:sid', saveSession)

export default router
