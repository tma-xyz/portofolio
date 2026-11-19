import { useEffect, useRef } from 'react'

// Langit malam yang hidup:
//  - 3 lapis bintang (jauh/tengah/dekat) dengan parallax saat scroll dan gerak kursor / miring HP
//  - bintang berkelip, campuran putih / oranye / kuning (tema black hole), bintang besar dengan kilau silang
//  - nebula bara hangat yang melayang pelan (CSS) + pita galaksi tipis
//  - bintang jatuh yang lebih halus
// Dibuat ringan untuk HP: DPR dibatasi, bintang lebih sedikit, ~30fps di layar sentuh, gambar per-warna (fillStyle jarang
// berganti) dengan globalAlpha, tanpa efek blur-bayangan canvas.
export default function Starfield() {
  const ref = useRef(null)

  useEffect(() => {
    const c = ref.current
    const ctx = c.getContext('2d')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const tints = ['255,255,255', '255,255,255', '255,255,255', '255,138,0', '255,196,107', '255,226,170', '255,170,70']
    const coarse = window.matchMedia('(pointer: coarse)').matches
    let w = 0, h = 0, dpr = 1, raf = 0, stars = [], shoots = [], groups = [], small = false
    let lastDraw = 0
    let sy = 0, tx = 0, ty = 0, mx = 0, my = 0
    let last = performance.now()

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      small = w < 700 || coarse // HP / layar sentuh: mode ringan
      dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2)
      c.width = Math.round(w * dpr)
      c.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const area = w * h
      const count = Math.min(small ? 110 : 320, Math.floor(area / 5200))
      stars = Array.from({ length: count }, () => {
        const q = Math.random()
        const z = q < 0.58 ? 0.2 : q < 0.9 ? 0.55 : 1 
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          z,
          r: z === 1 ? 0.9 + Math.random() * 1.1 : z === 0.55 ? 0.6 + Math.random() * 0.6 : 0.3 + Math.random() * 0.45,
          a: Math.random() * 6.28,
          s: 0.006 + Math.random() * 0.024,
          dx: (Math.random() - 0.5) * 0.05 * z,
          tint: tints[Math.floor(Math.random() * tints.length)],
          glint: z === 1 && Math.random() < 0.35,
        }
      })
      groups = [...new Set(tints)].map((t) => ({ fill: `rgb(${t})`, list: stars.filter((st) => st.tint === t) }))
    }
    resize()

    const tick = (now) => {
      raf = requestAnimationFrame(tick)
      if (small && now - lastDraw < 30) return // ~30fps di HP: kelip bintang tidak butuh 60fps
      lastDraw = now
      const dt = Math.min(2.5, (now - last) / 16.67)
      last = now
      mx += (tx - mx) * 0.04 * dt
      my += (ty - my) * 0.04 * dt
      ctx.clearRect(0, 0, w, h)

      for (const g of groups) {
        ctx.fillStyle = g.fill
        ctx.strokeStyle = g.fill
        for (const s of g.list) {
          if (!reduce) { s.a += s.s * dt; s.x += s.dx * dt }
          if (s.x < -10) s.x = w + 10
          if (s.x > w + 10) s.x = -10
          // parallax: lapisan dekat bergerak lebih jauh
          const px = s.x + mx * s.z * 26
          const py = (((s.y - sy * s.z * 0.28 + my * s.z * 26) % h) + h) % h
          const tw = Math.sin(s.a) * 0.5 + 0.5
          const o = 0.22 + tw * 0.78
          ctx.globalAlpha = o
          ctx.beginPath()
          ctx.arc(px, py, s.r, 0, 6.2832)
          ctx.fill()
          if (s.z === 1) {
            ctx.globalAlpha = o * 0.14 // halo lembut
            ctx.beginPath()
            ctx.arc(px, py, s.r * 4, 0, 6.2832)
            ctx.fill()
            if (s.glint && tw > 0.6) {
              const L = s.r * 7 * tw
              ctx.globalAlpha = (tw - 0.6) * 1.4
              ctx.lineWidth = 0.7
              ctx.beginPath()
              ctx.moveTo(px - L, py); ctx.lineTo(px + L, py)
              ctx.moveTo(px, py - L); ctx.lineTo(px, py + L)
              ctx.stroke()
            }
          }
        }
      }
      ctx.globalAlpha = 1

      if (!reduce && Math.random() < 0.0032 * dt && shoots.length < (small ? 2 : 3)) {
        const sp = 8 + Math.random() * 5
        shoots.push({ x: Math.random() * w * 0.9, y: Math.random() * h * 0.5, vx: sp, vy: sp * 0.55, life: 1, len: 11 + Math.random() * 8 })
      }
      shoots = shoots.filter((s) => s.life > 0 && s.x < w + 120 && s.y < h + 120)
      for (const s of shoots) {
        const tx2 = s.x - s.vx * s.len
        const ty2 = s.y - s.vy * s.len
        const g = ctx.createLinearGradient(s.x, s.y, tx2, ty2)
        g.addColorStop(0, `rgba(255,241,214,${0.95 * s.life})`)
        g.addColorStop(0.3, `rgba(255,150,40,${0.5 * s.life})`)
        g.addColorStop(1, 'rgba(255,138,0,0)')
        ctx.strokeStyle = g
        ctx.lineWidth = 1.3
        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(tx2, ty2)
        ctx.stroke()
        ctx.fillStyle = `rgba(255,236,200,${s.life})`
        ctx.beginPath()
        ctx.arc(s.x, s.y, 1.6, 0, 6.2832)
        ctx.fill()
        ctx.fillStyle = `rgba(255,150,40,${0.25 * s.life})` // pengganti blur-bayangan (mahal di GPU HP)
        ctx.beginPath()
        ctx.arc(s.x, s.y, 4.5, 0, 6.2832)
        ctx.fill()
        s.x += s.vx * dt
        s.y += s.vy * dt
        s.life -= 0.012 * dt
      }
    }
    raf = requestAnimationFrame(tick)

    const onScroll = () => (sy = window.scrollY)
    const onMove = (e) => { tx = e.clientX / w - 0.5; ty = e.clientY / h - 0.5 }
    const onTilt = (e) => {
      if (e.gamma == null) return
      tx = Math.max(-0.5, Math.min(0.5, e.gamma / 60))
      ty = Math.max(-0.5, Math.min(0.5, (e.beta - 40) / 80))
    }
    const onVis = () => {
      cancelAnimationFrame(raf)
      if (!document.hidden) { last = performance.now(); raf = requestAnimationFrame(tick) }
    }
    window.addEventListener('resize', resize)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('deviceorientation', onTilt, { passive: true })
    document.addEventListener('visibilitychange', onVis)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('deviceorientation', onTilt)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return (
    <div className="sky" aria-hidden="true">
      <div className="nebula nebula--1" />
      <div className="nebula nebula--2" />
      <div className="nebula nebula--3" />
      <div className="galaxy" />
      <canvas ref={ref} className="starfield" />
    </div>
  )
}
