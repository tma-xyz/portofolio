import { useEffect, useState } from 'react'
import { ExternalLink, ArrowRight, Mail } from 'lucide-react'
import { Github, Tiktok, Instagram } from './Icons.jsx'
import Rv from './Reveal.jsx'
import { useLang } from '../i18n.jsx'

function useTyping(words) {
  const [text, setText] = useState('')
  useEffect(() => {
    let w = 0, i = 0, del = false, t
    const step = () => {
      const word = words[w]
      i += del ? -1 : 1
      setText(word.slice(0, i))
      let d = del ? 45 : 90
      if (!del && i === word.length) { del = true; d = 1400 }
      else if (del && i === 0) { del = false; w = (w + 1) % words.length; d = 350 }
      t = setTimeout(step, d)
    }
    step()
    return () => clearTimeout(t)
  }, [words.join('|')])
  return text
}

export default function Hero() {
  const { t, d } = useLang()
  const { profile } = d
  const typed = useTyping(profile.roles)
  return (
    <section id="home" className="hero section">
      <Rv className="hero__left" y={40} blur={0}>
        <h1 className="hero__title">
          <span className="accent">{t.hero.title1}</span>
          <br />
          {t.hero.title2}
        </h1>
        <p className="hero__role">
          {typed}
          <b className="caret" />
        </p>
        <p className="hero__intro">{profile.intro}</p>
        <div className="hero__btns">
          <a className="btn btn--solid" href="#portfolio">
            {t.hero.project} <ExternalLink size={13} />
          </a>
          <a className="btn btn--ghost" href="#contact">
            {t.hero.contact} <ArrowRight size={13} />
          </a>
        </div>
        <div className="findme">
          <span className="mono accent-soft">{t.hero.findMe}</span>
          <a href={profile.github} target="_blank" rel="noreferrer"><Github /></a>
          <a href={profile.tiktok} target="_blank" rel="noreferrer"><Tiktok /></a>
          <a href={profile.instagram} target="_blank" rel="noreferrer"><Instagram /></a>
          <a href={`mailto:${profile.email}`}><Mail size={16} /></a>
        </div>
      </Rv>

      <Rv y={50} blur={0} delay={100}>
      <aside className="glass music">
        <h3>{t.hero.musicTitle}</h3>
        <p>{t.hero.musicDesc}</p>
        <iframe
          title="Spotify"
          src={profile.spotifyEmbed}
          width="100%"
          height="352"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      </aside>
      </Rv>
    </section>
  )
}
