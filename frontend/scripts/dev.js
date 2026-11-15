// `npm run dev` -> menjalankan API komentar (port 8000) + Vite (port 5173) sekaligus.
// Vite sudah mem-proxy /api dan /storage ke 127.0.0.1:8000 (lihat vite.config.js).
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const vite = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js')
if (!fs.existsSync(vite)) {
  console.error('Vite belum terpasang. Jalankan dulu: npm install')
  process.exit(1)
}
const run = (args) => spawn(process.execPath, args, { cwd: root, stdio: 'inherit' })
const api = run([path.join('server', 'index.js')])
const web = run([vite, ...process.argv.slice(2)])

const stop = () => { api.kill(); web.kill() }
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
web.on('exit', (code) => { api.kill(); process.exit(code ?? 0) })
api.on('exit', (code) => { if (code) { console.error(`[dev] API berhenti (kode ${code}).`); web.kill(); process.exit(code) } })
