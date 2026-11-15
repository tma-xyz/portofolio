import { useCallback, useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n.jsx'

// INTRO TIRAI (bukan zoom).
//   Lapisan atas  : video black hole full layar + teks "Memasuki Portofolio..."  (komponen ini)
//   Lapisan bawah : Hero sudah ada dari awal, hanya tertutup (App.jsx)
//   0 - 1.2 dtk   : diam
//   1.2 - 2.3 dtk : lapisan atas bergeser ke kiri, translateX(-100%), 1.1 dtk, cubic-bezier(0.7, 0, 0.3, 1)
//                   (bersamaan, Hero di belakang bergeser dari kanan translateX(30px) -> 0: lihat onGo + .site--go)
//   Skip          : langsung onDone()
// Selama portal berjalan, body overflow: hidden. Tidak ada efek zoom / scale.
const SRC = `${import.meta.env.BASE_URL}blackhole.mp4`
const HOLD_MS = 1200
const SLIDE_MS = 1100
const FAILSAFE = 8000

// Frame video 1024x576. object-fit: cover memotong sisi saat rasio layar berbeda, jadi posisi video diatur agar
// LUBANG HITAM tetap utuh di layar dan teks diletakkan tepat di tengah lubangnya.
const VW = 1024
const VH = 576
const HX = 0.695 // pusat lubang (x / lebar frame)
const HY = 0.385 // pusat bagian gelap lubang (y / tinggi frame)
const HOLE_W = 195 // lebar bagian gelap lubang pada frame asli (px)

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
    cx: -px * (wd - vw) + HX * wd,
    cy: -py * (hd - vh) + HY * hd,
    hole: HOLE_W * s,
  }
}

export default function Portal({ onGo, onDone }) {
  const { t } = useLang()
  const videoRef = useRef(null)
  const finished = useRef(false)
  const [go, setGo] = useState(false)
  const [lay, setLay] = useState(() => layout(window.innerWidth, window.innerHeight))

  const finish = useCallback(() => {
    if (finished.current) return
    finished.current = true
    onDone()
  }, [onDone])

  useEffect(() => {
    const v = videoRef.current
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden' // body overflow hidden selama portal berjalan

    const onResize = () => setLay(layout(window.innerWidth, window.innerHeight))
    window.addEventListener('resize', onResize)

    if (v) {
      v.muted = true
      const p = v.play()
      if (p && p.catch) p.catch(() => {}) // autoplay ditahan browser: tirai tetap berjalan
    }
    const t1 = setTimeout(() => { setGo(true); onGo?.() }, HOLD_MS) // detik 1.2: tirai mulai bergeser
    const t2 = setTimeout(finish, HOLD_MS + SLIDE_MS + 30) // detik 2.3: selesai
    const t3 = setTimeout(finish, FAILSAFE)

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3)
      window.removeEventListener('resize', onResize)
      document.body.style.overflow = prevOverflow === 'hidden' ? '' : prevOverflow
      if (v) {
        v.pause()
        if (finished.current) { v.removeAttribute('src'); v.load() } // bebaskan memori video
      }
    }
  }, [onGo, finish])

  return (
    <div
      className={`portal${go ? ' portal--go' : ''}`}
      style={{ '--tx': `${lay.cx}px`, '--ty': `${lay.cy}px`, '--hole': `${lay.hole}px` }}
    >
      <video
        ref={videoRef}
        className="portal__video"
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
      <div className="portal__vignette" aria-hidden="true" />
      <div className="bh-text" aria-hidden="true">{t.loader.entering}</div>
      <button type="button" className="bh-skip" onClick={finish}>
        Skip &gt;
      </button>
    </div>
  )
}
