import { useCallback, useEffect, useState } from 'react'
import Starfield from './components/Starfield.jsx'
import Portal from './components/Portal.jsx'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import Portfolio from './components/Portfolio.jsx'
import Contact from './components/Contact.jsx'
import LangSwitch from './components/LangSwitch.jsx'
import { useLang } from './i18n.jsx'
import { initSmoothScroll } from './lib/smoothScroll.js'

export default function App() {
  // Intro tirai: Hero sudah ada dari awal (hanya tertutup lapisan Portal di atasnya).
  //   'hold' = tirai menutup, Hero bergeser 30px ke kanan | 'go' = tirai geser kiri, Hero kembali ke 0 | 'done' = selesai
  const [phase, setPhase] = useState('hold')
  const onGo = useCallback(() => setPhase('go'), [])
  const onDone = useCallback(() => setPhase('done'), [])
  const { d } = useLang()

  useEffect(() => initSmoothScroll(), [])

  useEffect(() => {
    document.title = `${d.profile.name} | Portofolio`
  }, [d.profile.name])

  return (
    <>
      <Starfield />
      <div className="beams beams--on" aria-hidden="true" />
      {phase !== 'done' && <Portal onGo={onGo} onDone={onDone} />}
      <div id="main-content" className={`site${phase === 'hold' ? ' site--shift' : phase === 'go' ? ' site--go' : ''}`}>
        <LangSwitch />
        <Navbar />
        <main>
          <Hero />
          <About />
          <Portfolio />
          <Contact />
        </main>
      </div>
    </>
  )
}
