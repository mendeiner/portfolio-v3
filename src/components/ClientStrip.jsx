import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { projects } from '../data/projects'

function ClientItem({ client, logo, slug, mouseRef }) {
  const [imgFailed, setImgFailed] = useState(false)
  const wrapRef = useRef(null)
  const targetRef = useRef(null)
  const activeRef = useRef(false)
  const rafRef = useRef(null)

  useEffect(() => {
    const tick = () => {
      const el = wrapRef.current
      const target = targetRef.current
      if (el && target) {
        const rect = el.getBoundingClientRect()
        const { x, y } = mouseRef.current
        const inside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom

        if (inside) {
          const cx = rect.left + rect.width / 2
          const cy = rect.top + rect.height / 2
          const dx = (x - cx) * 0.3
          const dy = (y - cy) * 0.3
          target.style.transform = `translate(${dx}px, ${dy}px) scale(1.12)`
          if (!activeRef.current) {
            target.style.transition = 'transform 0.12s ease-out'
            target.style.opacity = '1'
            activeRef.current = true
          }
        } else if (activeRef.current) {
          target.style.transform = 'translate(0px, 0px) scale(1)'
          target.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)'
          target.style.opacity = ''
          activeRef.current = false
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [mouseRef])

  return (
    <Link to={`/work/${slug}`} ref={wrapRef} className="inline-flex items-center mx-16 shrink-0">
      {logo && !imgFailed ? (
        <img
          ref={targetRef}
          src={logo}
          alt={client}
          onError={() => setImgFailed(true)}
          className="h-40 w-auto max-w-[320px] object-contain brightness-0 invert opacity-70"
          draggable={false}
        />
      ) : (
        <span
          ref={targetRef}
          className="font-body text-[13px] font-semibold tracking-[.2em] uppercase text-paper/60"
        >
          {client}
        </span>
      )}
    </Link>
  )
}

export default function ClientStrip() {
  const items = projects.map((p) => ({ client: p.client, logo: p.logo, slug: p.slug }))
  const firstSetRef = useRef(null)
  const containerRef = useRef(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const [ready, setReady] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onMove = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY } }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useEffect(() => {
    const inject = (width) => {
      if (width <= 0) return
      let el = document.getElementById('marquee-kf')
      if (!el) {
        el = document.createElement('style')
        el.id = 'marquee-kf'
        document.head.appendChild(el)
      }
      el.textContent = `@keyframes marquee-px { from { transform: translateX(0px) } to { transform: translateX(-${width}px) } }`
      setReady(true)
    }

    const ro = new ResizeObserver(() => {
      if (firstSetRef.current) inject(firstSetRef.current.scrollWidth)
    })

    if (firstSetRef.current) {
      ro.observe(firstSetRef.current)
      inject(firstSetRef.current.scrollWidth)
    }

    return () => {
      ro.disconnect()
      document.getElementById('marquee-kf')?.remove()
    }
  }, [])

  useEffect(() => {
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.2 }
    )
    if (containerRef.current) io.observe(containerRef.current)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="overflow-hidden border-t border-b border-paper/10 py-5">
      <div
        className="flex items-center"
        style={ready && visible ? { animation: 'marquee-px 14s linear infinite', willChange: 'transform' } : {}}
      >
        <div ref={firstSetRef} className="flex items-center shrink-0">
          {items.map((item, i) => (
            <ClientItem key={i} client={item.client} logo={item.logo} slug={item.slug} mouseRef={mouseRef} />
          ))}
        </div>
        <div className="flex items-center shrink-0" aria-hidden="true">
          {items.map((item, i) => (
            <ClientItem key={`c${i}`} client={item.client} logo={item.logo} slug={item.slug} mouseRef={mouseRef} />
          ))}
        </div>
      </div>
    </div>
  )
}
