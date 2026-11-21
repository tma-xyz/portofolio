import { useEffect, useRef } from 'react'
import { Code2, Award, FileText, CodeXml, ArrowUpRight } from 'lucide-react'
import Rv from './Reveal.jsx'
import { useLang } from '../i18n.jsx'

/* Foto: lapisan kedua muncul lewat "kuas" yang mengikuti kursor, jejaknya memudar.
   Saat pertama kali terlihat, lapisan kedua penuh sebentar lalu memudar. */
function Photo({ name }) {
  const box = useRef(null)
  const cv = useRef(null)
  const dot = useRef(null)

  useEffect(() => {
    const canvas = cv.current
    const ctx = canvas.getContext('2d')
    const mask = document.createElement('canvas')
    const mctx = mask.getContext('2d')
    const alt = new Image()
    alt.src = '/images/i.png'

    let W = 0, H = 0, dpr = 1, raf, visible = false, introAt = null
    const pts = []
    const LIFE = 900

    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = box.current.clientWidth
      H = box.current.clientHeight
      canvas.width = mask.width = Math.round(W * dpr)
      canvas.height = mask.height = Math.round(H * dpr)
    }
    size()
    window.addEventListener('resize', size)

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible) introAt = performance.now() // main lagi tiap foto masuk layar
    }, { threshold: 0.35 })
    io.observe(box.current)

    const addPoint = (x, y) => {
      const last = pts[pts.length - 1]
      const now = performance.now()
      const step = W * 0.05
      if (last) {
        const d = Math.hypot(x - last.x, y - last.y)
        const n = Math.floor(d / step)
        for (let i = 1; i <= n; i++) {
          pts.push({ x: last.x + ((x - last.x) * i) / (n + 1), y: last.y + ((y - last.y) * i) / (n + 1), t: now })
        }
      }
      pts.push({ x, y, t: now })
    }
    const move = (e) => {
      const r = box.current.getBoundingClientRect()
      const p = e.touches ? e.touches[0] : e
      const x = p.clientX - r.left
      const y = p.clientY - r.top
      addPoint(x, y)
      dot.current.style.transform = `translate(${x}px, ${y}px)`
      dot.current.style.opacity = 1
    }
    const leave = () => { dot.current.style.opacity = 0 }
    const el = box.current
    el.addEventListener('mousemove', move)
    el.addEventListener('mouseleave', leave)
    el.addEventListener('touchmove', move, { passive: true })
    el.addEventListener('touchend', leave)

    const frame = () => {
      raf = requestAnimationFrame(frame)
      if (!visible || !alt.complete || !alt.naturalWidth) return
      const now = performance.now()
      while (pts.length && now - pts[0].t > LIFE) pts.shift()

      mctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      mctx.clearRect(0, 0, W, H)
      const R = W * 0.2
      for (const p of pts) {
        const a = 1 - (now - p.t) / LIFE
        const r = R * (0.55 + 0.45 * a)
        const g = mctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r)
        g.addColorStop(0, `rgba(255,255,255,${a})`)
        g.addColorStop(0.55, `rgba(255,255,255,${a * 0.85})`)
        g.addColorStop(1, 'rgba(255,255,255,0)')
        mctx.fillStyle = g
        mctx.fillRect(p.x - r, p.y - r, r * 2, r * 2)
      }
      // intro: lapisan penuh ~1.6 dtk lalu memudar ~1 dtk
      if (introAt !== null) {
        const t = (now - introAt) / 1000
        const fa = t < 1.6 ? 1 : Math.max(0, 1 - (t - 1.6) / 1.0)
        if (fa > 0) {
          mctx.fillStyle = `rgba(255,255,255,${fa})`
          mctx.fillRect(0, 0, W, H)
        }
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const iw = alt.naturalWidth, ih = alt.naturalHeight
      const s = Math.max(W / iw, H / ih)
      ctx.filter = 'grayscale(1) contrast(1.1)'
      // Sinkron dengan object-position: center 20%
      const dx = (W - iw * s) / 2
      const dy = (H - ih * s) * 0.2
      ctx.drawImage(alt, dx, dy, iw * s, ih * s)
      ctx.filter = 'none'
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.globalCompositeOperation = 'destination-in'
      ctx.drawImage(mask, 0, 0)
      ctx.globalCompositeOperation = 'source-over'
    }
    frame()

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener('resize', size)
      el.removeEventListener('mousemove', move)
      el.removeEventListener('mouseleave', leave)
      el.removeEventListener('touchmove', move)
      el.removeEventListener('touchend', leave)
    }
  }, [])

  return (
    <div ref={box} className="photo">
      <img src="/images/i.png" alt={name} draggable="false" decoding="async" />
     <canvas ref={cv} className="photo__alt" style={{ filter: 'grayscale(1) brightness(0.75) contrast(1.4)' }} />
      <span ref={dot} className="photo__dot" />
    </div>
  )
}

function Item({ it, square, delay }) {
  return (
    <Rv delay={delay} y={22} blur={5}>
      <div className="glass item">
        <div className={`item__logo ${square ? 'item__logo--sq' : ''}`}>{it.letter}</div>
        <div>
          <b>{it.title}</b>
          <small>{it.sub}</small>
          <small className="yr">{it.year}</small>
        </div>
      </div>
    </Rv>
  )
}

function Stat({ icon: Icon, n, label, sub, delay }) {
  const spot = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }
  return (
    <Rv delay={delay} y={60} blur={10} scale={0.94}>
      <div className="glass stat" onMouseMove={spot}>
        <div className="stat__top">
          <span className="stat__icon"><Icon size={14} /></span>
          <span className="stat__n">{n}</span>
        </div>
        <b>{label}</b>
        <small>{sub}</small>
        <ArrowUpRight size={11} className="stat__arrow" />
        <i className="stat__line" />
      </div>
    </Rv>
  )
}

export default function About() {
  const { t, d } = useLang()
  const { profile, education, experience, projects, certificates } = d
  return (
    <section id="about" className="about section">
      <Rv as="h2" className="sec-title" y={40}>{t.about.title}</Rv>

      <div className="about__top">
        <Rv y={50} blur={10} delay={50}>
          <h2 className="about__hi">
            <span className="blue">{t.about.hi}</span>
            <br />
            <span className="about__name">{profile.name}</span>
          </h2>
          <a className="btn btn--solid" href={profile.resume}>
            <FileText size={12} /> {t.about.resume}
          </a>
        </Rv>

        <Rv y={60} blur={12} delay={150}>
          <Photo name={profile.name} />
        </Rv>

        <Rv className="about__right" y={50} blur={10} delay={250}>
          <p className="about__text">{profile.about}</p>
          <a className="btn btn--outline" href="#portfolio">
            <CodeXml size={12} /> {t.about.projects}
          </a>
        </Rv>
      </div>

      <div className="about__cols">
        <div>
          <Rv as="h3" className="col-title">{t.about.education}</Rv>
          <div className="scroll">
            {education.map((e, i) => <Item key={e.title} it={e} delay={i * 120} />)}
          </div>
        </div>
        <div>
          <Rv as="h3" className="col-title" delay={120}>{t.about.experience}</Rv>
          <div className="scroll scroll--h">
            {experience.map((e, i) => <Item key={e.title} it={e} square delay={150 + i * 120} />)}
          </div>
        </div>
      </div>

      <div className="stats">
        <Stat icon={Code2} n={projects.length} label={t.about.stats.projects[0]} sub={t.about.stats.projects[1]} delay={0} />
        <Stat icon={Award} n={certificates.length} label={t.about.stats.certificates[0]} sub={t.about.stats.certificates[1]} delay={120} />
      </div>
    </section>
  )
}