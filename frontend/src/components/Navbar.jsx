import { useEffect, useRef, useState } from 'react'
import { scrollToY } from '../lib/smoothScroll.js'
import { useLang } from '../i18n.jsx'

const ids = ['home', 'about', 'portfolio', 'contact']

export default function Navbar() {
  const { t, lang } = useLang()
  const [active, setActive] = useState('home')
  const [moving, setMoving] = useState(false)
  const refs = useRef({})
  const [pos, setPos] = useState({ left: 0, width: 0 })

  // scroll spy
  useEffect(() => {
    const onScroll = () => {
      const mid = window.scrollY + window.innerHeight * 0.45
      let cur = 'home'
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.offsetTop <= mid) cur = id
      }
      setActive(cur)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const measure = () => {
    const el = refs.current[active]
    if (el) setPos({ left: el.offsetLeft, width: el.offsetWidth })
  }
  useEffect(() => {
    measure()
    setMoving(true)
    const tm = setTimeout(() => setMoving(false), 650)
    return () => clearTimeout(tm)
  }, [active])

  // ukur ulang saat bahasa berganti (lebar tombol berubah) dan saat resize / font selesai dimuat
  useEffect(() => {
    measure()
    const tm = setTimeout(measure, 120)
    document.fonts?.ready.then(measure)
    return () => clearTimeout(tm)
  }, [lang])
  useEffect(() => {
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  })

  const go = (id) => {
    const el = document.getElementById(id)
    if (el) scrollToY(id === 'home' ? 0 : el.offsetTop)
  }

  return (
    <nav className="nav">
      <div className="nav__pill" style={{ left: pos.left, width: pos.width }} />
      <div className={`nav__mascot ${moving ? 'is-moving' : ''}`} style={{ left: pos.left + pos.width / 2 }}>
        <div className="mascot">
          <span className="mascot__head">
            <i className="mascot__eye" />
            <i className="mascot__eye" />
            <b className="mascot__mouth" />
            <u className="mascot__cheek mascot__cheek--l" />
            <u className="mascot__cheek mascot__cheek--r" />
          </span>
          <s className="mascot__tail" />
        </div>
      </div>
      {ids.map((id) => (
        <button
          key={id}
          ref={(el) => (refs.current[id] = el)}
          className={active === id ? 'on' : ''}
          onClick={() => go(id)}
        >
          {t.nav[id]}
        </button>
      ))}
    </nav>
  )
}
