import { useCallback, useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n.jsx'

// Intro: video black hole (blackhole.mp4, file ASLI tanpa kompres/crop) sebagai background di belakang teks.
//   0 - 5 dtk   : video berputar (loop), teks "Memasuki Portofolio..." + tombol Skip >
//   5 dtk / Skip: transisi "kesedot" 900 ms ease-in-out -> video scale 1 -> 1.25 + blur 0 -> 12px + opacity 1 -> 0,
//                 halaman utama muncul bersamaan (fade-in + scale 0.96 -> 1); setelah itu intro dihapus.
const SRC = `${import.meta.env.BASE_URL}blackhole.mp4`
const INTRO_MS = 5000
const EXIT_MS = 900
const FAILSAFE = 12000

// Frame video asli 1024x576. object-fit: cover memotong sisi saat rasio layar berbeda, jadi posisi video diatur agar
// LUBANG HITAM tetap utuh di layar (tidak ikut terpotong) dan teks diletakkan tepat di tengah lubangnya.
const VW = 1024
const VH = 576
const HX = 0.695 // pusat lubang (x / lebar frame)
const HY = 0.385 // pusat bagian gelap lubang (y / tinggi frame)
const HOLE_W = 195 // lebar bagian gelap lubang (px pada frame asli)

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

function layout(vw, vh) {
  const s = Math.max(vw / VW, vh / VH) // skala object-fit: cover
  const wd = VW * s
  const hd = VH * s
  const pos = (hole, disp, view) => (disp > view ? clamp((hole * disp - view / 2) / (disp - view), 0, 1) : 0.5)
  const px = pos(HX, wd, vw)
  const py = pos(HY, hd, vh)
  return {
    objectPosition: `${(px * 100).toFixed(2)}% ${(py * 100).toFixed(2)}%`,
    cx: -px * (wd - vw) + HX * wd, // posisi lubang di layar (px)
    cy: -py * (hd - vh) + HY * hd,
    hole: HOLE_W * s,
  }
}

export default function Loader({ onLeave, onDone }) {
  const { t } = useLang()
  const videoRef = useRef(null)
  const finished = useRef(false)
  const leaving = useRef(false)
  const leaveFn = useRef(() => {})
  const [isLeaving, setIsLeaving] = useState(false)
  const [lay, setLay] = useState(() => layout(window.innerWidth, window.innerHeight))

  const finish = useCallback((skipped = false) => {
    if (finished.current) return
    finished.current = true
    onDone(skipped)
  }, [onDone])

  useEffect(() => {
    const v = videoRef.current
    const timers = []
    const later = (fn, ms) => timers.push(setTimeout(fn, ms))

    const onResize = () => setLay(layout(window.innerWidth, window.innerHeight))
    window.addEventListener('resize', onResize)

    // masuk ke portofolio: transisi 900 ms (bukan cut), lalu intro dihapus
    leaveFn.current = (skipped = false) => {
      if (leaving.current) return
      leaving.current = true
      setIsLeaving(true)
      onLeave?.()
      later(() => finish(skipped), EXIT_MS + 40)
    }

    if (v) {
      v.muted = true
      const p = v.play()
      if (p && p.catch) p.catch(() => {}) // autoplay ditahan browser: intro tetap berjalan
    }
    later(() => leaveFn.current(false), INTRO_MS) // intro CUMA 5 detik, tidak menunggu video habis
    later(() => finish(), FAILSAFE)

    return () => {
      timers.forEach(clearTimeout)
      window.removeEventListener('resize', onResize)
      if (v) {
        v.pause()
        if (finished.current) { // bebaskan memori video setelah intro selesai
          v.removeAttribute('src')
          v.load()
        }
      }
    }
  }, [onLeave, finish])

  return (
    <div
      className={`intro${isLeaving ? ' is-leaving' : ''}`}
      style={{ '--tx': `${lay.cx}px`, '--ty': `${lay.cy}px`, '--hole': `${lay.hole}px` }}
    >
      <video
        ref={videoRef}
        className="intro__video"
        style={{ objectPosition: lay.objectPosition }}
        src={SRC}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        aria-hidden="true"
        tabIndex={-1}
      />
      <div className="intro__tint" aria-hidden="true" />
      <div className="intro__vignette" aria-hidden="true" />
      <div className="bh-text" aria-hidden="true">{t.loader.entering}</div>
      <button type="button" className="bh-skip" onClick={() => leaveFn.current(true)}>
        Skip &gt;
      </button>
    </div>
  )
}
