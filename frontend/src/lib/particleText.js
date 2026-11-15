// Partikel yang berkumpul dari sisi kiri/kanan membentuk teks, lalu berubah jadi teks tajam.
const FONT = (s) => `700 ${s}px Arial, Helvetica, "Liberation Sans", sans-serif`
const LINES = [
  { text: 'Welcome To My', color: '#e9f1ff', particle: '#ffffff' },
  { text: 'Portofolio Website', color: '#1b5cf0', particle: '#2f6bff' },
]

export function layoutIntro(W, H) {
  const size = Math.min(0.0513 * W, 0.1 * H)
  const mid = 0.523 * H
  const y1 = mid - 0.635 * size
  const y2 = mid + 0.635 * size
  // blok Loading: tepat di bawah teks (jarak rapat), titik tengah blok = rowY
  const rowFont = Math.max(11, 0.0115 * W)
  const gap = Math.max(12, 0.12 * size)
  const rowY = y2 + 0.35 * size + gap + (1.75 * rowFont + 1) / 2
  return { size, y1, y2, rowY, barW: Math.max(150, 0.2 * W), rowFont }
}

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const smooth = (a, b, t) => { const x = clamp((t - a) / (b - a)); return x * x * (3 - 2 * x) }
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
const rnd = (a, b) => a + Math.random() * (b - a)

export function createParticleText(canvas, { start = performance.now() } = {}) {
  const ctx = canvas.getContext('2d')
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const W = canvas.clientWidth
  const H = canvas.clientHeight
  canvas.width = W * dpr
  canvas.height = H * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  const L = layoutIntro(W, H)
  const gap = W > 1400 ? 3 : 2

  // sampling piksel teks
  const off = document.createElement('canvas')
  off.width = W
  off.height = H
  const o = off.getContext('2d', { willReadFrequently: true })
  o.textAlign = 'center'
  o.textBaseline = 'middle'
  o.font = FONT(L.size)

  const parts = []
  LINES.forEach((ln, i) => {
    o.clearRect(0, 0, W, H)
    o.fillStyle = '#fff'
    o.fillText(ln.text, W / 2, i ? L.y2 : L.y1)
    const data = o.getImageData(0, 0, W, H).data
    for (let y = 0; y < H; y += gap) {
      for (let x = 0; x < W; x += gap) {
        if (data[(y * W + x) * 4 + 3] > 128) {
          parts.push(makeP(x, y, i, 1.5))
        }
      }
    }
  })
  // partikel "awan" tambahan yang tidak jadi teks
  const extras = Math.min(1800, Math.floor(W * 1.4))
  for (let i = 0; i < extras; i++) {
    const a = Math.random() * Math.PI * 2
    const r = Math.sqrt(Math.random())
    parts.push(makeP(W / 2 + Math.cos(a) * r * W * 0.32, H * 0.52 + Math.sin(a) * r * H * 0.22, 2, rnd(0.8, 1.7)))
  }

  function makeP(tx, ty, bucket, size) {
    const left = Math.random() < 0.5
    const gx = (Math.random() + Math.random() + Math.random()) / 3 // condong ke tengah band
    const sx = left ? gx * W * 0.3 : W - gx * W * 0.3
    const sy = H * rnd(0.04, 0.96)
    const ang = Math.atan2(ty - sy, tx - sx) + Math.PI / 2
    const amp = rnd(-90, 90)
    return {
      sx, sy, tx, ty, bucket, size,
      delay: rnd(0.45, 1.15),
      dur: rnd(1.0, 1.5),
      px: Math.cos(ang) * amp, py: Math.sin(ang) * amp,
      ph: Math.random() * 6.28,
    }
  }

  const fills = ['#ffffff', '#2f6bff', '#bcd4ff']
  let raf
  const frame = () => {
    const t = (performance.now() - start) / 1000
    ctx.clearRect(0, 0, W, H)

    const appear = smooth(0.1, 0.9, t)
    const crisp = smooth(2.1, 2.9, t)
    const alphaOf = [appear * (1 - crisp), appear * (1 - crisp), appear * (1 - smooth(1.7, 2.6, t))]

    for (let b = 0; b < 3; b++) {
      const al = alphaOf[b]
      if (al <= 0.01) continue
      ctx.globalAlpha = al
      ctx.fillStyle = fills[b]
      for (const p of parts) {
        if (p.bucket !== b) continue
        const u = clamp((t - p.delay) / p.dur)
        const e = ease(u)
        const sw = Math.sin(Math.PI * u)
        const drift = (1 - e) * Math.sin(t * 1.4 + p.ph) * 7
        const sh = u >= 1 ? Math.sin(t * 9 + p.ph) * 0.4 : 0
        const x = p.sx + (p.tx - p.sx) * e + p.px * sw + drift + sh
        const y = p.sy + (p.ty - p.sy) * e + p.py * sw + drift * 0.6 + sh
        ctx.fillRect(x, y, p.size, p.size)
      }
    }
    ctx.globalAlpha = 1

    if (crisp > 0.01) {
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = FONT(L.size)
      ctx.globalAlpha = crisp
      ctx.fillStyle = LINES[0].color
      ctx.fillText(LINES[0].text, W / 2, L.y1)
      ctx.fillStyle = LINES[1].color
      ctx.fillText(LINES[1].text, W / 2, L.y2)
      ctx.globalAlpha = 1
    }
    raf = requestAnimationFrame(frame)
  }
  frame()

  return { destroy: () => cancelAnimationFrame(raf), layout: L }
}
