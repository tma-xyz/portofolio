import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { createMessage } from '../controllers/messagesController.js'

const router = Router()

// Rate limit untuk kirim pesan: max 5 request per 1 menit (sesuai throttle:5,1 di Laravel)
const messagePostLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Terlalu banyak pengiriman pesan. Coba lagi sebentar lagi.' },
})

router.post('/', messagePostLimiter, createMessage)

export default router
