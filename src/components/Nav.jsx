import { useState } from 'react'
import { Link } from 'react-router-dom'
import AsterMark from './AsterMark'

const links = [
  { to: '/work',    label: 'Trabalho' },
  { to: '/about',   label: 'Sobre' },
  { to: '/contact', label: 'Contato' },
]

export default function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-16 bg-navy/90 backdrop-blur-sm border-b border-paper/10">
        <Link to="/" className="flex items-center gap-2.5 group" onClick={() => setOpen(false)}>
          <AsterMark size={22} color="#FE214D" />
          <span className="font-body font-semibold text-paper text-xs tracking-widest uppercase">
            brunoedita<span className="text-signal">.</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="font-body text-xs tracking-widest uppercase text-paper/70 hover:text-paper transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/contact"
            className="font-body text-xs tracking-wider uppercase px-4 py-2 bg-paper text-navy font-semibold hover:bg-signal hover:text-paper transition-colors"
          >
            me fala
          </Link>
        </nav>

        <button
          className="md:hidden flex flex-col gap-[5px] p-2"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
        >
          <span className={`block w-5 h-[1.5px] bg-paper transition-all duration-300 ${open ? 'rotate-45 translate-y-[6.5px]' : ''}`} />
          <span className={`block w-5 h-[1.5px] bg-paper transition-all duration-300 ${open ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-[1.5px] bg-paper transition-all duration-300 ${open ? '-rotate-45 -translate-y-[6.5px]' : ''}`} />
        </button>
      </header>

      <div
        className={`fixed inset-0 z-40 bg-navy flex flex-col justify-center px-8 transition-all duration-500 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <nav className="flex flex-col gap-8">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="font-display text-paper text-5xl tracking-tight hover:text-signal transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link
          to="/contact"
          onClick={() => setOpen(false)}
          className="mt-12 font-body text-sm tracking-widest uppercase text-signal"
        >
          me fala →
        </Link>
      </div>
    </>
  )
}
