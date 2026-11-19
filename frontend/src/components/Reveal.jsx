import { useEffect, useRef, useState } from 'react'

// Muncul saat masuk layar dan RESET saat keluar layar, jadi animasinya
// main lagi setiap scroll ke bawah maupun ke atas.
// Dua observer = histeresis, supaya tidak berkedip di tepi layar:
//  - masuk  : saat ~12% elemen terlihat
//  - keluar : hanya saat elemen sudah JAUH di luar layar (lebih jauh dari jarak geser posisi tersembunyi).
// Kenapa: posisi tersembunyi menggeser elemen (translate). Jika "keluar" dideteksi tepat di tepi layar, geseran itu
// membawa elemen masuk lagi -> muncul -> keluar -> sembunyi -> ... tanpa henti (judul tampak naik-turun terus).
// Dengan margin keluar > jarak geser, geseran tidak pernah cukup untuk memicu "masuk" lagi.
export default function Rv({ as: Tag = 'div', delay = 0, x: xProp = 0, y = 36, blur = 8, scale = 1, className = '', style, children, ...rest }) {
  // di layar sempit, geseran dari samping dibatasi (28px): geseran besar menimbulkan scroll horizontal di HP
  const x = typeof window !== 'undefined' && window.innerWidth < 700 ? Math.sign(xProp) * Math.min(Math.abs(xProp), 28) : xProp
  const ref = useRef(null)
  const [on, setOn] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const pad = Math.ceil(Math.max(Math.abs(x), Math.abs(y)) + Math.abs(blur)) + 48 // margin histeresis (px)
    const enter = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setOn(true) },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    )
    const leave = new IntersectionObserver(
      ([e]) => { if (!e.isIntersecting) setOn(false) },
      { threshold: 0, rootMargin: `${pad}px ${pad}px ${pad}px ${pad}px` },
    )
    enter.observe(el)
    leave.observe(el)
    return () => { enter.disconnect(); leave.disconnect() }
  }, [x, y, blur])

  return (
    <Tag
      ref={ref}
      className={`rv ${on ? 'rv--in' : ''} ${className}`}
      style={{ '--d': `${delay}ms`, '--x': `${x}px`, '--y': `${y}px`, '--b': `${blur}px`, '--s': scale, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
