import { useLang } from '../i18n.jsx'

const Globe = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
  </svg>
)

// Satu tombol di pojok kanan atas: tekan ID -> langsung EN, tekan EN -> langsung ID
export default function LangSwitch() {
  const { lang, setLang } = useLang()
  const next = lang === 'id' ? 'en' : 'id'
  return (
    <div className="lang">
      <button
        className="lang__btn"
        onClick={() => setLang(next)}
        aria-label={next === 'en' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
      >
        <Globe />
        <span key={lang} className="lang__code">{lang.toUpperCase()}</span>
      </button>
    </div>
  )
}
