// Server API ringan (Node.js murni, TANPA dependensi) untuk komentar & pesan.
// Kontraknya sama dengan backend Laravel di ../backend:
//   GET  /api/comments      -> { data: [ {id, name, comment, photo_url, created_at, ...} ] }
//   POST /api/comments      (multipart: name, comment, photo?) -> 201 + objek komentar
//   POST /api/messages      (JSON: name, email, message)       -> 201
//   GET  /storage/avatars/* -> foto profil komentar
// Produksi: `npm run build` lalu `npm start` -> server ini juga menyajikan folder dist/.
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT) || 8000
const HOST = process.env.HOST || (process.env.PORT ? '0.0.0.0' : '127.0.0.1')
const DATA_DIR = process.env.DATA_DIR || path.join(here, 'data')
const AVATAR_DIR = process.env.STORAGE_DIR ? path.join(process.env.STORAGE_DIR, 'avatars') : path.join(here, 'storage', 'avatars')
const DIST_DIR = process.env.DIST_DIR || path.join(here, '..', 'dist')
const CORS_ORIGIN = process.env.CORS_ORIGIN || '' // isi jika frontend di domain lain
const TRUST_PROXY = process.env.TRUST_PROXY === '1'
const MAX_PHOTO = 5 * 1024 * 1024
const MAX_BODY = MAX_PHOTO + 512 * 1024

fs.mkdirSync(DATA_DIR, { recursive: true })
fs.mkdirSync(AVATAR_DIR, { recursive: true })

// ---------- penyimpanan JSON (tulis atomik, antre agar tidak bentrok) ----------
const file = (n) => path.join(DATA_DIR, `${n}.json`)
const read = (n) => { try { return JSON.parse(fs.readFileSync(file(n), 'utf8')) } catch { return [] } }
const db = { comments: read('comments'), messages: read('messages') }
let queue = Promise.resolve()
const persist = (n) => {
  const body = JSON.stringify(db[n], null, 2)
  queue = queue.then(async () => {
    const tmp = file(n) + '.tmp'
    await fs.promises.writeFile(tmp, body)
    await fs.promises.rename(tmp, file(n))
  }).catch((e) => console.error('[api] gagal menyimpan', n, e.message))
  return queue
}
const nextId = (list) => list.reduce((m, x) => Math.max(m, x.id), 0) + 1

// ---------- util ----------
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.txt': 'text/plain; charset=utf-8', '.map': 'application/json',
}
const send = (res, status, body, headers = {}) => {
  res.writeHead(status, { 'X-Content-Type-Options': 'nosniff', ...headers })
  res.end(body)
}
const json = (res, status, obj) => send(res, status, JSON.stringify(obj), { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
const invalid = (res, errors) => json(res, 422, { message: 'Data tidak valid.', errors })

const hits = new Map() // ip -> [timestamps]
const limited = (req, key, max) => {
  const fwd = TRUST_PROXY && String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()
  const id = `${key}:${fwd || req.socket.remoteAddress}`
  const now = Date.now()
  const list = (hits.get(id) || []).filter((t) => now - t < 60_000)
  if (list.length >= max) { hits.set(id, list); return true }
  list.push(now); hits.set(id, list)
  return false
}
setInterval(() => { const now = Date.now(); for (const [k, v] of hits) if (!v.some((t) => now - t < 60_000)) hits.delete(k) }, 60_000).unref()

const HARD_LIMIT = 25 * 1024 * 1024 // lebih dari ini: putus koneksi (bukan upload wajar)
const readBody = (req, limit) => new Promise((resolve, reject) => {
  const chunks = []
  let size = 0
  req.on('data', (c) => {
    size += c.length
    if (size > HARD_LIMIT) { req.destroy(); return reject(Object.assign(new Error('too large'), { status: 413 })) }
    if (size <= limit) chunks.push(c) // kelebihan dibuang, tetap dibaca agar balasan 413 sampai ke browser
  })
  req.on('end', () => (size > limit ? reject(Object.assign(new Error('too large'), { status: 413 })) : resolve(Buffer.concat(chunks))))
  req.on('error', reject)
})

function parseMultipart(buf, boundary) {
  const parts = []
  const delim = Buffer.from(`--${boundary}`)
  let pos = buf.indexOf(delim)
  while (pos !== -1) {
    const next = buf.indexOf(delim, pos + delim.length)
    if (next === -1) break
    const start = pos + delim.length + 2 // lewati \r\n setelah boundary
    const end = next - 2 // buang \r\n sebelum boundary berikut
    const headerEnd = buf.indexOf('\r\n\r\n', start)
    if (headerEnd !== -1 && headerEnd <= end) {
      const head = buf.subarray(start, headerEnd).toString('utf8')
      parts.push({
        name: /name="([^"]*)"/i.exec(head)?.[1],
        filename: /filename="([^"]*)"/i.exec(head)?.[1],
        body: buf.subarray(headerEnd + 4, end),
      })
    }
    pos = next
  }
  return parts
}

// jenis gambar dicek dari isi file (bukan nama/header), SVG sengaja ditolak
function sniffImage(b) {
  if (b.length > 12 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg'
  if (b.length > 12 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png'
  if (b.length > 12 && b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP') return 'webp'
  return null
}
const clean = (s) => String(s ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim()

// ---------- handler API ----------
async function comments(req, res) {
  if (req.method === 'GET') {
    const data = [...db.comments].sort((a, b) => b.id - a.id).slice(0, 50)
    return json(res, 200, { data })
  }
  if (req.method !== 'POST') return json(res, 405, { message: 'Method not allowed' })
  if (limited(req, 'comment', 10)) return json(res, 429, { message: 'Terlalu banyak permintaan. Coba lagi sebentar.' })

  let fields = {}
  let photo = null
  const ctype = String(req.headers['content-type'] || '')
  let raw
  try { raw = await readBody(req, MAX_BODY) } catch (e) { return json(res, e.status || 400, { message: 'Permintaan terlalu besar.' }) }
  const m = /multipart\/form-data;\s*boundary=(?:"([^"]+)"|([^;]+))/i.exec(ctype)
  if (m) {
    for (const p of parseMultipart(raw, m[1] || m[2])) {
      if (p.filename !== undefined) { if (p.name === 'photo' && p.body.length) photo = p.body } else if (p.name) fields[p.name] = p.body.toString('utf8')
    }
  } else if (ctype.includes('application/json')) {
    try { fields = JSON.parse(raw.toString('utf8')) } catch { return invalid(res, { comment: ['JSON tidak valid.'] }) }
  } else return invalid(res, { comment: ['Format permintaan tidak didukung.'] })

  const name = clean(fields.name)
  const comment = clean(fields.comment)
  const errors = {}
  if (!name) errors.name = ['Nama wajib diisi.']
  else if ([...name].length > 60) errors.name = ['Nama maksimal 60 karakter.']
  if (!comment) errors.comment = ['Komentar wajib diisi.']
  else if ([...comment].length > 500) errors.comment = ['Komentar maksimal 500 karakter.']
  let ext = null
  if (photo) {
    if (photo.length > MAX_PHOTO) errors.photo = ['Foto maksimal 5MB.']
    else if (!(ext = sniffImage(photo))) errors.photo = ['Foto harus jpg, png, atau webp.']
  }
  if (Object.keys(errors).length) return invalid(res, errors)

  let photoPath = null
  if (photo) {
    const fname = `${crypto.randomBytes(16).toString('hex')}.${ext}`
    await fs.promises.writeFile(path.join(AVATAR_DIR, fname), photo)
    photoPath = `avatars/${fname}`
  }
  const now = new Date().toISOString()
  const row = {
    id: nextId(db.comments), name, comment, photo_path: photoPath,
    created_at: now, updated_at: now, photo_url: photoPath ? `/storage/${photoPath}` : null,
  }
  db.comments.push(row)
  await persist('comments')
  return json(res, 201, row)
}

async function messages(req, res) {
  if (req.method !== 'POST') return json(res, 405, { message: 'Method not allowed' })
  if (limited(req, 'message', 5)) return json(res, 429, { message: 'Terlalu banyak permintaan. Coba lagi sebentar.' })
  let f
  try { f = JSON.parse((await readBody(req, 64 * 1024)).toString('utf8')) } catch (e) { return e.status ? json(res, e.status, { message: 'Permintaan terlalu besar.' }) : invalid(res, { message: ['JSON tidak valid.'] }) }
  const name = clean(f.name), email = clean(f.email), message = clean(f.message)
  const errors = {}
  if (!name || [...name].length > 60) errors.name = ['Nama wajib diisi (maks 60 karakter).']
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) errors.email = ['Email tidak valid.']
  if (!message || [...message].length > 2000) errors.message = ['Pesan wajib diisi (maks 2000 karakter).']
  if (Object.keys(errors).length) return invalid(res, errors)
  const now = new Date().toISOString()
  const row = { id: nextId(db.messages), name, email, message, created_at: now, updated_at: now }
  db.messages.push(row)
  await persist('messages')
  return json(res, 201, row)
}

// ---------- file statis ----------
function serveFile(req, res, fp, headers = {}) {
  fs.stat(fp, (err, st) => {
    if (err || !st.isFile()) return json(res, 404, { message: 'Not found' })
    const type = MIME[path.extname(fp).toLowerCase()] || 'application/octet-stream'
    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '')
    if (range && (range[1] || range[2])) { // dukung Range (video diputar/seek di Safari)
      let a = range[1] ? Number(range[1]) : st.size - Number(range[2])
      let b = range[1] && range[2] ? Math.min(Number(range[2]), st.size - 1) : st.size - 1
      if (a > b || a >= st.size) return send(res, 416, '', { 'Content-Range': `bytes */${st.size}` })
      res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${a}-${b}/${st.size}`, 'Content-Length': b - a + 1, 'Accept-Ranges': 'bytes', 'X-Content-Type-Options': 'nosniff', ...headers })
      return req.method === 'HEAD' ? res.end() : fs.createReadStream(fp, { start: a, end: b }).pipe(res)
    }
    res.writeHead(200, { 'Content-Type': type, 'Content-Length': st.size, 'Accept-Ranges': 'bytes', 'X-Content-Type-Options': 'nosniff', ...headers })
    req.method === 'HEAD' ? res.end() : fs.createReadStream(fp).pipe(res)
  })
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x')
    const p = decodeURIComponent(url.pathname)
    if (CORS_ORIGIN) {
      res.setHeader('Access-Control-Allow-Origin', CORS_ORIGIN)
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept')
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      if (req.method === 'OPTIONS') return send(res, 204, '')
    }
    if (p === '/api/comments') return await comments(req, res)
    if (p === '/api/messages') return await messages(req, res)
    if (p.startsWith('/api/')) return json(res, 404, { message: 'Not found' })

    if (p.startsWith('/storage/avatars/')) {
      const n = p.slice('/storage/avatars/'.length)
      if (!/^[a-f0-9]{32}\.(jpg|png|webp)$/.test(n)) return json(res, 404, { message: 'Not found' })
      return serveFile(req, res, path.join(AVATAR_DIR, n), { 'Cache-Control': 'public, max-age=31536000, immutable' })
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') return json(res, 405, { message: 'Method not allowed' })
    if (!fs.existsSync(DIST_DIR)) return send(res, 200, 'API komentar aktif. Jalankan `npm run build` untuk menyajikan situs dari server ini.', { 'Content-Type': 'text/plain; charset=utf-8' })
    const target = path.normalize(path.join(DIST_DIR, p === '/' ? 'index.html' : p))
    if (!target.startsWith(path.normalize(DIST_DIR + path.sep))) return json(res, 403, { message: 'Forbidden' })
    if (fs.existsSync(target) && fs.statSync(target).isFile()) {
      const hashed = /\/assets\//.test(target.replaceAll('\\', '/'))
      return serveFile(req, res, target, { 'Cache-Control': hashed ? 'public, max-age=31536000, immutable' : 'public, max-age=300' })
    }
    return serveFile(req, res, path.join(DIST_DIR, 'index.html'), { 'Cache-Control': 'no-cache' }) // fallback SPA
  } catch (e) {
    console.error('[api]', e)
    if (!res.headersSent) json(res, 500, { message: 'Terjadi kesalahan di server.' })
    else res.end()
  }
})

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.log(`[api] Port ${PORT} sudah dipakai (mungkin Laravel atau API lain) -> memakai yang sudah berjalan.`)
    process.exit(0)
  }
  console.error('[api]', e)
  process.exit(1)
})
server.listen(PORT, HOST, () => console.log(`[api] Komentar & pesan aktif di http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}  (data: ${DATA_DIR})`))
