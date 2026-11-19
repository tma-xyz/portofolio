import { useEffect, useRef, useState } from 'react'
import { Code2, Award, Layers, ArrowRight } from 'lucide-react'
import Rv from './Reveal.jsx'
import { useLang } from '../i18n.jsx'

const tabs = [
  { id: 'projects', icon: Code2 },
  { id: 'certificates', icon: Award },
  { id: 'tech', icon: Layers },
]

// fallback thumbnail (jika proyek tidak punya gambar): gradien gelap hangat sesuai tema
const thumb = () => ({
  background: 'linear-gradient(135deg, #2A1608, #120A04)',
})

export default function Portfolio() {
  const { t, d } = useLang()
  const { projects, certificates, techStack } = d
  const [tab, setTab] = useState('projects') // tab yang dipilih
  const [shown, setShown] = useState('projects') // isi yang tampil
  const [out, setOut] = useState(false)
  const timer = useRef(null)

  // ganti tab: isi lama memudar + blur dulu, baru isi baru masuk berurutan
  const pick = (id) => {
    if (id === tab) return
    setTab(id)
    setOut(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setShown(id)
      setOut(false)
    }, 280)
  }
  useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <section id="portfolio" className="portfolio section">
      <Rv as="h2" className="sec-title sec-title--grey" y={40}>{t.portfolio.title}</Rv>

      <Rv y={30} blur={6} delay={80}>
        <div className="tabs">
          {tabs.map(({ id, icon: I }) => (
            <button key={id} className={tab === id ? 'on' : ''} onClick={() => pick(id)}>
              <I size={14} />
              {t.portfolio.tabs[id]}
            </button>
          ))}
        </div>
      </Rv>

      <Rv y={0} blur={0}>
        <div key={shown} className={`grid ${out ? 'grid--out' : 'grid--in'}`}>
          {shown === 'projects' &&
            projects.map((p, i) => (
              <article key={p.title} className="card" style={{ '--i': i }}>
                <div className="card__thumb" style={p.image ? { backgroundImage: `url(${p.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : thumb(p.hue)}>
                  {!p.image && <span>{p.title}</span>}
                </div>
                <h4>{p.title}</h4>
                <p>{p.desc}</p>
                <a className="btn btn--tiny" href={p.link}>{t.portfolio.details} <ArrowRight size={11} /></a>
              </article>
            ))}

        {shown === 'certificates' &&
  certificates.map((c, i) => (
    <article key={c.title} className="cert" style={{ '--i': i }}>
      <div className="card__thumb card__thumb--cert" style={{ height: 'auto', padding: 0, overflow: 'hidden' }}>
        {c.image ? (
          <img src={c.image} alt={c.title} loading="lazy" decoding="async" style={{ width: '100%', height: 'auto', display: 'block' }} />
        ) : (
          <span>{c.title}</span>
        )}
      </div>
              </article>
            ))}


          {shown === 'tech' && (
            <div className="tech">
              {techStack.map((s, i) => (
                <div key={s.name} className="tech__item" style={{ '--i': i }}>
                  <span className="tech__logo" style={{ color: s.color }}>{s.badge}</span>
                  <small>{s.name}</small>
                </div>
              ))}
            </div>
          )}
        </div>
      </Rv>
    </section>
  )
}
