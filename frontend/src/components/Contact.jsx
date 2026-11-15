import { useEffect, useState } from 'react'
import { Send, MessageCircle, User, Mail, ImagePlus, Loader2 } from 'lucide-react'
import { Github, Tiktok, Instagram } from './Icons.jsx'
import Rv from './Reveal.jsx'
import { useLang } from '../i18n.jsx'

const API = import.meta.env.VITE_API_URL || '/api'
// jika API di domain lain, alamat foto relatif (/storage/...) diarahkan ke domain API itu
const API_ORIGIN = /^https?:\/\//.test(API) ? new URL(API).origin : ''
const fileUrl = (u) => (u && u.startsWith('/') ? API_ORIGIN + u : u)
const OK_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_PHOTO = 5 * 1024 * 1024

// baca balasan JSON; balasan non-JSON (mis. index.html dari hosting statis tanpa backend) dianggap gagal
async function readJson(r) {
  try { return await r.json() } catch { return null }
}

function ago(d, a) {
  const s = Math.floor((Date.now() - new Date(d)) / 1000)
  if (s < 60) return a.now
  const m = Math.floor(s / 60)
  if (m < 60) return a.m(m)
  const h = Math.floor(m / 60)
  if (h < 24) return a.h(h)
  return a.d(Math.floor(h / 24))
}

export default function Contact() {
  const { t, d } = useLang()
  const { profile } = d
  const [msg, setMsg] = useState({ name: '', email: '', message: '' })
  const [msgState, setMsgState] = useState({ busy: false, note: '' })

  const [comments, setComments] = useState([])
  const [cm, setCm] = useState({ name: '', comment: '' })
  const [photo, setPhoto] = useState(null)
  const [cmState, setCmState] = useState({ busy: false, note: '' })
  const [loading, setLoading] = useState(true)
  const [loadFail, setLoadFail] = useState(false)

  const load = () =>
    fetch(`${API}/comments`, { headers: { Accept: 'application/json' } })
      .then(async (r) => {
        const j = r.ok ? await readJson(r) : null
        const list = Array.isArray(j) ? j : j && Array.isArray(j.data) ? j.data : null
        if (!list) throw new Error(`API komentar tidak merespons dengan benar (${r.status})`)
        setComments(list)
        setLoadFail(false)
      })
      .catch((e) => {
        console.warn('[komentar] gagal memuat:', e.message)
        setLoadFail(true)
      })
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

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

  const sendComment = async () => {
    const fail = (note) => setCmState({ busy: false, note })
    if (!cm.name.trim()) return fail(t.contact.cmNeedName)
    if (!cm.comment.trim()) return fail(t.contact.cmNeedComment)
    if (photo && (photo.size > MAX_PHOTO || !OK_TYPES.includes(photo.type))) return fail(t.contact.cmFail)

    setCmState({ busy: true, note: '' })
    const fd = new FormData()
    fd.append('name', cm.name.trim())
    fd.append('comment', cm.comment.trim())
    if (photo) fd.append('photo', photo)
    try {
      const r = await fetch(`${API}/comments`, { method: 'POST', headers: { Accept: 'application/json' }, body: fd })
      const j = await readJson(r)
      if (r.ok && j && j.id != null) {
        setCm({ name: '', comment: '' })
        setPhoto(null)
        setCmState({ busy: false, note: '' })
        setLoadFail(false)
        setComments((prev) => [j, ...prev.filter((c) => c.id !== j.id)]) // langsung tampil, lalu sinkron ulang
        load()
        return
      }
      // gagal: tampilkan alasan yang spesifik, bukan satu pesan generik
      const errs = (j && j.errors) || {}
      if (r.status === 422 && errs.name) return fail(t.contact.cmNeedName)
      if (r.status === 422 && errs.comment) return fail(t.contact.cmNeedComment)
      if (r.status === 422 && errs.photo) return fail(t.contact.cmFail)
      if (r.status === 413) return fail(t.contact.cmFail)
      if (r.status === 429) return fail(t.contact.cmRate)
      console.warn('[komentar] server menolak:', r.status, j)
      return fail(t.contact.cmServer)
    } catch (e) {
      console.warn('[komentar] tidak bisa terhubung ke API:', e.message)
      fail(t.contact.cmOffline)
    }
  }

  return (
    <section id="contact" className="contact section">
      <Rv as="h2" className="sec-title" y={40}>{t.contact.title}</Rv>

      <div className="contact__grid">
        <Rv x={-70} y={30} blur={10}>
        <div className="glass panel stagger">
          <h3 className="blue">{t.contact.heading}</h3>
          <p className="dim">{t.contact.sub}</p>

          <label className="field"><User size={14} />
            <input placeholder={t.contact.name} value={msg.name} onChange={(e) => setMsg({ ...msg, name: e.target.value })} />
          </label>
          <label className="field"><Mail size={14} />
            <input type="email" placeholder={t.contact.email} value={msg.email} onChange={(e) => setMsg({ ...msg, email: e.target.value })} />
          </label>
          <label className="field field--area"><MessageCircle size={14} />
            <textarea placeholder={t.contact.message} value={msg.message} onChange={(e) => setMsg({ ...msg, message: e.target.value })} />
          </label>
          <button className="btn btn--solid btn--block" disabled={msgState.busy} onClick={sendMsg}>
            {msgState.busy ? <Loader2 size={14} className="spin" /> : <Send size={14} />} {t.contact.send}
          </button>
          {msgState.note && <p className="note">{msgState.note === 'sent' ? t.contact.sent : t.contact.sendFail}</p>}

          <hr />
          <h4 className="findme-title">{t.contact.findMe}</h4>
          <a className="social" href={profile.tiktok} target="_blank" rel="noreferrer">
            <span className="social__ic tt"><Tiktok /></span>
            <span><b>{t.contact.follow}</b><small>{profile.tiktokHandle}</small></span>
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
        </Rv>

        <Rv x={70} y={30} blur={10} delay={120}>
        <div className="glass panel stagger">
          <h3><MessageCircle size={16} /> {t.contact.comments} <small className="count">{comments.length}</small></h3>

          <label className="field"><User size={14} />
            <input placeholder={t.contact.cmName} value={cm.name} onChange={(e) => setCm({ ...cm, name: e.target.value })} />
          </label>
          <p className="lbl">{t.contact.cmLabel}</p>
          <textarea className="area" placeholder={t.contact.cmPlaceholder} value={cm.comment} onChange={(e) => setCm({ ...cm, comment: e.target.value })} />
          <p className="lbl">{t.contact.photoLabel}</p>
          <label className="upload">
            <ImagePlus size={15} /> {photo ? photo.name : t.contact.choosePhoto}
            <input type="file" accept="image/*" hidden onChange={(e) => setPhoto(e.target.files[0] || null)} />
          </label>
          <small className="center dim">{t.contact.maxSize}</small>
          <button className="btn btn--solid btn--block" disabled={cmState.busy} onClick={sendComment}>
            {cmState.busy ? <Loader2 size={14} className="spin" /> : <Send size={14} />} {t.contact.sendComment}
          </button>
          {cmState.note && <p className="note">{cmState.note}</p>}

          <div className="comments">
            {loading && [0, 1, 2].map((i) => <div key={i} className="comment skel" style={{ '--i': i }} />)}
            {!loading && loadFail && <p className="note">{t.contact.cmLoadFail}</p>}
            {comments.map((c, i) => (
              <div key={c.id} className="comment" style={{ '--i': i }}>
                {c.photo_url ? <img src={fileUrl(c.photo_url)} alt="" /> : <span className="comment__av"><User size={13} /></span>}
                <div>
                  <b>{c.name}</b>
                  <small>{c.comment}</small>
                </div>
                <time>{ago(c.created_at, t.contact.ago)}</time>
              </div>
            ))}
          </div>
        </div>
        </Rv>
      </div>
    </section>
  )
}
