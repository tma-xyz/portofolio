import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import * as base from './data.js'

export const ui = {
  id: {
    nav: { home: 'Beranda', about: 'Tentang', portfolio: 'Portofolio', contact: 'Kontak' },
    hero: {
      title1: 'Mengubah Ide',
      title2: 'Menjadi Kenyataan',
      project: 'Proyek',
      contact: 'Hubungi Saya',
      findMe: 'TEMUKAN SAYA',
      musicTitle: 'Putaran Harian',
      musicDesc: 'Kumpulan lagu pilihan yang menemani dan menginspirasiku saat coding.',
    },
    about: {
      title: 'Tentang Saya',
      hi: 'Hai, aku',
      resume: 'Lihat CV',
      projects: 'Lihat Proyek',
      education: 'Pendidikan',
      experience: 'Pengalaman',
      stats: {
        projects: ['PROYEK', 'Solusi inovatif yang dibuat'],
        certificates: ['SERTIFIKAT', 'Keahlian yang tervalidasi'],
      },
    },
    portfolio: {
      title: 'Portofolio',
      tabs: { projects: 'Proyek', certificates: 'Sertifikat', tech: 'Tech Stack' },
      details: 'Detail',
      certificate: 'SERTIFIKAT',
    },
    contact: {
      title: 'Hubungi Saya',
      heading: 'Hubungi',
      sub: 'Ada yang mau didiskusikan? Langsung kirim pesan aja ya..!',
      name: 'Nama Anda',
      email: 'Email Anda',
      message: 'Pesan Anda',
      send: 'Kirim Pesan',
      sent: 'Pesan terkirim, terima kasih!',
      sendFail: 'Gagal mengirim. Cek isian kamu.',
      findMe: 'TEMUKAN SAYA',
      follow: 'Ikuti Saya',
      comments: 'Komentar',
      cmName: 'Nama kamu',
      cmLabel: 'Komentar',
      cmPlaceholder: 'Tulis komentar kamu di sini...',
      photoLabel: 'Foto Profil (opsional)',
      choosePhoto: 'Pilih Foto Profil',
      maxSize: 'Ukuran maks: 5MB',
      sendComment: 'Kirim Komentar',
      cmFail: 'Gagal mengirim komentar (maks 5MB, jpg/png/webp).',
      cmNeedName: 'Nama wajib diisi.',
      cmNeedComment: 'Tulis komentarnya dulu ya.',
      cmOffline: import.meta.env.DEV ? 'Server komentar tidak terhubung.' : 'Server komentar tidak terhubung. Coba lagi nanti.',
      cmServer: 'Server sedang bermasalah. Coba lagi nanti.',
      cmRate: 'Terlalu banyak komentar dalam waktu singkat. Coba lagi sebentar.',
      cmLoadFail: import.meta.env.DEV ? 'Komentar belum bisa dimuat. Pastikan API berjalan.' : 'Komentar belum bisa dimuat. Coba muat ulang halaman.',
      ago: { now: 'baru saja', m: (n) => `${n} mnt lalu`, h: (n) => `${n} jam lalu`, d: (n) => `${n} hari lalu` },
    },
    loader: { entering: 'Memasuki Portofolio...' },
    lang: 'Bahasa',
  },
  en: {
    nav: { home: 'Home', about: 'About', portfolio: 'Portfolio', contact: 'Contact' },
    hero: {
      title1: 'Turning Ideas',
      title2: 'Into Reality',
      project: 'Project',
      contact: 'Contact Me',
      findMe: 'FIND ME',
      musicTitle: 'Daily Rotation',
      musicDesc: 'A curated collection of tracks that keep me in the zone and inspired while coding.',
    },
    about: {
      title: 'About Me',
      hi: "Hi, I'm",
      resume: 'View Resume',
      projects: 'View Projects',
      education: 'Education',
      experience: 'Experience',
      stats: {
        projects: ['PROJECTS', 'Innovative solutions crafted'],
        certificates: ['CERTIFICATES', 'Skills validated'],
      },
    },
    portfolio: {
      title: 'Portfolio',
      tabs: { projects: 'Projects', certificates: 'Certificates', tech: 'Tech Stack' },
      details: 'Details',
      certificate: 'CERTIFICATE',
    },
    contact: {
      title: 'Contact Me',
      heading: 'Get in Touch',
      sub: 'Want to discuss something? Just send me a message!',
      name: 'Your name',
      email: 'Your email',
      message: 'Your message',
      send: 'Send Message',
      sent: 'Message sent, thank you!',
      sendFail: 'Failed to send. Please check your input.',
      findMe: 'FIND ME',
      follow: 'Follow Me',
      comments: 'Comments',
      cmName: 'Your name',
      cmLabel: 'Comment',
      cmPlaceholder: 'Write your comment here...',
      photoLabel: 'Profile Photo (optional)',
      choosePhoto: 'Choose Profile Photo',
      maxSize: 'Max file size: 5MB',
      sendComment: 'Send Comment',
      cmFail: 'Failed to send comment (max 5MB, jpg/png/webp).',
      cmNeedName: 'Please enter your name.',
      cmNeedComment: 'Please write a comment first.',
      cmOffline: import.meta.env.DEV ? 'Comment server not reachable.' : 'Comment server not reachable. Please try again later.',
      cmServer: 'The server is having problems. Please try again later.',
      cmRate: 'Too many comments in a short time. Please wait a moment.',
      cmLoadFail: import.meta.env.DEV ? 'Comments could not be loaded. Make sure the API is running.' : 'Comments could not be loaded. Please reload the page.',
      ago: { now: 'just now', m: (n) => `${n}m ago`, h: (n) => `${n}h ago`, d: (n) => `${n}d ago` },
    },
    loader: { entering: 'Entering Portfolio...' },
    lang: 'Language',
  },
}

// gabungkan data dasar (Indonesia) dengan override English per index
const mergeList = (list, over = []) => list.map((it, i) => ({ ...it, ...(over[i] || {}) }))
function buildData(lang) {
  if (lang === 'id') {
    const { profile, education, experience, projects, certificates, techStack } = base
    return { profile, education, experience, projects, certificates, techStack }
  }
  const e = base.en
  return {
    profile: { ...base.profile, ...e.profile },
    education: mergeList(base.education, e.education),
    experience: mergeList(base.experience, e.experience),
    projects: mergeList(base.projects, e.projects),
    certificates: mergeList(base.certificates, e.certificates),
    techStack: base.techStack,
  }
}

const Ctx = createContext(null)

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('lang') || 'id' } catch { return 'id' }
  })
  useEffect(() => {
    document.documentElement.lang = lang
    try { localStorage.setItem('lang', lang) } catch {}
  }, [lang])
  const value = useMemo(() => ({ lang, setLang, t: ui[lang], d: buildData(lang) }), [lang])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useLang = () => useContext(Ctx)
