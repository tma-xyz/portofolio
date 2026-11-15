import { useEffect, useRef } from 'react'

// Langit malam yang hidup:
//  - 3 lapis bintang (jauh/tengah/dekat) dengan parallax saat scroll dan gerak kursor / miring HP
//  - bintang berkelip, campuran putih / oranye / kuning (tema black hole), bintang besar dengan kilau silang
//  - nebula bara hangat yang melayang pelan (CSS) + pita galaksi tipis
//  - bintang jatuh yang lebih halus
export default function Starfield() {
  const ref = useRef(null)

  useEffect(() => {
    const c = ref.current
    const ctx = c.getContext('2d')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const tints = ['255,255,255', '255,255,255', '255,255,255', '255,138,0', '255,196,107', '255,226,170', '255,170,70']
    let w = 0, h = 0, dpr = 1, raf = 0, stars = [], shoots = []
    let sy = 0, tx = 0, ty = 0, mx = 0, my = 0
    let last = performance.now()

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      c.width = Math.round(w * dpr)
      c.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const area = w * h
      const count = Math.min(w < 700 ? 150 : 320, Math.floor(area / 5200))
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
    }
    resize()

    const tick = (now) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(2.5, (now - last) / 16.67)
      last = now
      mx += (tx - mx) * 0.04 * dt
      my += (ty - my) * 0.04 * dt
      ctx.clearRect(0, 0, w, h)

      for (const s of stars) {
        if (!reduce) { s.a += s.s * dt; s.x += s.dx * dt }
        if (s.x < -10) s.x = w + 10
        if (s.x > w + 10) s.x = -10
        // parallax: lapisan dekat bergerak lebih jauh
        const px = s.x + mx * s.z * 26
        const py = (((s.y - sy * s.z * 0.28 + my * s.z * 26) % h) + h) % h
        const tw = Math.sin(s.a) * 0.5 + 0.5
        const o = 0.22 + tw * 0.78
        ctx.fillStyle = `rgba(${s.tint},${o})`
        ctx.beginPath()
        ctx.arc(px, py, s.r, 0, 6.2832)
        ctx.fill()
        if (s.z === 1) {
          // halo lembut
          ctx.fillStyle = `rgba(${s.tint},${o * 0.14})`
          ctx.beginPath()
          ctx.arc(px, py, s.r * 4, 0, 6.2832)
          ctx.fill()
          if (s.glint && tw > 0.6) {
            const L = s.r * 7 * tw
            ctx.strokeStyle = `rgba(${s.tint},${(tw - 0.6) * 1.4})`
            ctx.lineWidth = 0.7
            ctx.beginPath()
            ctx.moveTo(px - L, py); ctx.lineTo(px + L, py)
            ctx.moveTo(px, py - L); ctx.lineTo(px, py + L)
            ctx.stroke()
          }
        }
      }

      if (!reduce && Math.random() < 0.0032 * dt && shoots.length < 3) {
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
        ctx.shadowColor = '#ff9a1f'
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.arc(s.x, s.y, 1.6, 0, 6.2832)
        ctx.fill()
        ctx.shadowBlur = 0
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
    <>
      <div className="nebula nebula--1" aria-hidden="true" />
      <div className="nebula nebula--2" aria-hidden="true" />
      <div className="nebula nebula--3" aria-hidden="true" />
      <div className="galaxy" aria-hidden="true" />
      <canvas ref={ref} className="starfield" aria-hidden="true" />
    </>
  )
}
