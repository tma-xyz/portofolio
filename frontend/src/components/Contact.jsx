import { useState } from 'react'
import { Send, User, Mail, MessageSquare, Loader2 } from 'lucide-react'
import { Github, Tiktok, Instagram } from './Icons.jsx'
import Rv from './Reveal.jsx'
import { useLang } from '../i18n.jsx'

const API = import.meta.env.VITE_API_URL || '/api'

export default function Contact() {
  const { t, d } = useLang()
  const { profile } = d
  const [msg, setMsg] = useState({ name: '', email: '', message: '' })
  const [msgState, setMsgState] = useState({ busy: false, note: '' })

  const sendMsg = async () => {
    setMsgState({ busy: true, note: '' })
    try {
      const r = await fetch(`${API}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(msg),
      })
      if (!r.ok) throw new Error()
      setMsg({ name: '', email: '', message: '' })
      setMsgState({ busy: false, note: 'sent' })
    } catch {
      setMsgState({ busy: false, note: 'fail' })
    }
  }

  return (
    <section id="contact" className="contact section">
      <Rv as="h2" className="sec-title" y={40}>{t.contact.title}</Rv>

      <div className="contact__grid">
        <Rv x={-50} y={30} blur={10}>
          <div className="glass panel stagger">
            <h3 className="blue">{t.contact.heading}</h3>
            <p className="dim">{t.contact.sub}</p>

            <label className="field"><User size={14} />
              <input placeholder={t.contact.name} value={msg.name} onChange={(e) => setMsg({ ...msg, name: e.target.value })} />
            </label>
            <label className="field"><Mail size={14} />
              <input type="email" placeholder={t.contact.email} value={msg.email} onChange={(e) => setMsg({ ...msg, email: e.target.value })} />
            </label>
            <label className="field field--area"><MessageSquare size={14} />
              <textarea placeholder={t.contact.message} value={msg.message} onChange={(e) => setMsg({ ...msg, message: e.target.value })} />
            </label>
            <button className="btn btn--solid btn--block" disabled={msgState.busy} onClick={sendMsg}>
              {msgState.busy ? <Loader2 size={14} className="spin" /> : <Send size={14} />} {t.contact.send}
            </button>
            {msgState.note && <p className="note">{msgState.note === 'sent' ? t.contact.sent : t.contact.sendFail}</p>}
          </div>
        </Rv>

        <Rv x={50} y={30} blur={10} delay={120}>
          <div className="glass panel stagger">
            <h3 className="blue">{t.contact.findMe}</h3>
            <p className="dim">{t.contact.follow}</p>

            <div className="contact__socials">
              <a className="social" href={profile.tiktok} target="_blank" rel="noreferrer">
                <span className="social__ic tt"><Tiktok /></span>
                <span><b>Tiktok</b><small>{profile.tiktokHandle}</small></span>
              </a>
              <a className="social" href={profile.instagram} target="_blank" rel="noreferrer">
                <span className="social__ic ig"><Instagram /></span>
                <span><b>Instagram</b><small>{profile.instagramHandle}</small></span>
              </a>
              <a className="social" href={profile.github} target="_blank" rel="noreferrer">
                <span className="social__ic gh"><Github /></span>
                <span><b>Github</b><small>{profile.githubHandle}</small></span>
              </a>
              <a className="social" href={`mailto:${profile.email}`}>
                <span className="social__ic gm"><Mail size={16} /></span>
                <span><b>Gmail</b><small>{profile.emailHandle}</small></span>
              </a>
            </div>
          </div>
        </Rv>
      </div>
    </section>
  )
}
