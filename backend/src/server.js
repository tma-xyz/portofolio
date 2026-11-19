import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

import messagesRouter from './routes/messages.js'

const app = express()
const PORT = process.env.PORT || 8000

// CORS setup: Mendukung multiple origins (domain production & localhost)
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'https://tmaxyz.my.id,http://localhost:5173')
  .split(',')
  .map((o) => o.trim())

app.use(
  cors({
    origin: (origin, callback) => {
      // Izinkan jika tanpa origin (curl, Postman), cocok dengan allowedOrigins, atau localhost
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('tmaxyz.my.id') ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:')
      ) {
        callback(null, true)
      } else {
        callback(null, true)
      }
    },
    credentials: true,
  })
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// API Routes
app.use('/api/messages', messagesRouter)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ message: 'Endpoint tidak ditemukan' })
})

// Global Error Handler
app.use((err, _req, res, _next) => {
  console.error('Server Unhandled Error:', err)
  res.status(500).json({ message: 'Terjadi kesalahan pada server' })
})

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`)
})
