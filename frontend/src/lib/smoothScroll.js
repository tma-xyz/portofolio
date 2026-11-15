// Scroll halus (inertia) seperti di video — tanpa library
let target = 0, current = 0, running = false, raf = 0

const maxY = () => document.documentElement.scrollHeight - window.innerHeight
const clamp = (v) => Math.max(0, Math.min(maxY(), v))

function loop() {
  current += (target - current) * 0.085
  if (Math.abs(target - current) < 0.4) {
    current = target
    window.scrollTo(0, current)
    running = false
    return
  }
  window.scrollTo(0, current)
  raf = requestAnimationFrame(loop)
}

function go(y) {
  if (!running) { current = window.scrollY; running = true }
  target = clamp(y)
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(loop)
}

export const scrollToY = (y) => go(y)

export function scrollToId(id) {
  const el = document.getElementById(id)
  if (el) go(el.getBoundingClientRect().top + window.scrollY)
}

export function initSmoothScroll() {
  target = current = window.scrollY

  const innerCanScroll = (el, dy) => {
    while (el && el !== document.body) {
      const st = getComputedStyle(el)
      if (/(auto|scroll)/.test(st.overflowY) && el.scrollHeight > el.clientHeight + 1) {
        if (dy < 0 ? el.scrollTop > 0 : el.scrollTop + el.clientHeight < el.scrollHeight - 1) return true
      }
      el = el.parentElement
    }
    return false
  }

  const onWheel = (e) => {
    if (e.ctrlKey || document.body.style.overflow === 'hidden') return
    if (innerCanScroll(e.target, e.deltaY)) return
    e.preventDefault()
    if (!running) target = window.scrollY
    go(target + e.deltaY * 0.9)
  }
  const onScroll = () => { if (!running) target = current = window.scrollY }
  const onClick = (e) => {
    const a = e.target.closest?.('a[href^="#"]')
    if (!a || a.getAttribute('href') === '#') return
    e.preventDefault()
    scrollToId(a.getAttribute('href').slice(1))
  }

  window.addEventListener('wheel', onWheel, { passive: false })
  window.addEventListener('scroll', onScroll, { passive: true })
  document.addEventListener('click', onClick)
  return () => {
    cancelAnimationFrame(raf)
    window.removeEventListener('wheel', onWheel)
    window.removeEventListener('scroll', onScroll)
    document.removeEventListener('click', onClick)
  }
}
