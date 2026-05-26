import { useState, useEffect, useContext, useRef } from 'react'
import { Link } from 'react-router-dom'
import { LoadingContext } from '../App'
import AsterMark from '../components/AsterMark'
import { HeroCanvas } from '../components/hero3d/HeroCanvas'
import ClientStrip from '../components/ClientStrip'
import ProjectCard from '../components/ProjectCard'
import { projects } from '../data/projects'
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '../components/ui/carousel'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const WORDS = ['edita', 'grava', 'produz']

function splitToChars(text, extraClass = '') {
  const words = text.split(' ')
  const result = []
  words.forEach((word, wi) => {
    result.push(
      <span key={`w${wi}`} className="inline-block whitespace-nowrap">
        {word.split('').map((char, ci) => (
          <span
            key={`${wi}-${ci}`}
            className={`belief-char inline-block${extraClass ? ' ' + extraClass : ''}`}
          >
            {char}
          </span>
        ))}
      </span>
    )
    if (wi < words.length - 1) {
      result.push(
        <span key={`s${wi}`} className="belief-char inline-block">&nbsp;</span>
      )
    }
  })
  return result
}

const makeLetters = (wordIdx, word) => [
  ...word.split('').map((c, i) => ({ char: c, key: `${wordIdx}-${i}`, signal: false })),
  { char: '.', key: `${wordIdx}-dot`, signal: true },
]

export default function Home() {
  const loaded = useContext(LoadingContext)

  const [isMuted, setIsMuted] = useState(true)
  const [volume, setVolume] = useState(0.8)

  const beliefSectionRef = useRef(null)
  const para1Ref = useRef(null)
  const para2Ref = useRef(null)
  const para3Ref = useRef(null)
  const blockquoteRef = useRef(null)

  useEffect(() => {
    const section = beliefSectionRef.current
    if (!section) return

    const chars = section.querySelectorAll('.belief-char')
    const paras = [para1Ref.current, para2Ref.current, para3Ref.current, blockquoteRef.current].filter(Boolean)

    gsap.set(chars, { opacity: 0, y: -22, x: 9 })
    gsap.set(paras, { opacity: 0 })

    const stagger = 0.025
    const charDuration = 0.45
    const paraStart = chars.length * stagger * 0.7

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 75%',
        once: true,
      },
    })

    tl.to(chars, {
      opacity: 1,
      y: 0,
      x: 0,
      duration: charDuration,
      stagger,
      ease: 'power2.inOut',
    }).to(paras, {
      opacity: 1,
      duration: 0.55,
      stagger: 0.2,
      ease: 'power2.out',
    }, paraStart)

    return () => tl.kill()
  }, [])

  const [letters, setLetters]       = useState([])
  const [writePos, setWritePos]     = useState(0)
  const [showCursor, setShowCursor] = useState(false)
  const [cursorOn, setCursorOn]     = useState(true)
  const timersRef = useRef([])

  const addTimer = (ms, fn) => {
    const id = setTimeout(fn, ms)
    timersRef.current.push(id)
  }
  const clearAllTimers = () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  useEffect(() => {
    if (!showCursor) { setCursorOn(true); return }
    const id = setInterval(() => setCursorOn(v => !v), 530)
    return () => clearInterval(id)
  }, [showCursor])

  function cycle(idx) {
    const next = (idx + 1) % WORDS.length
    const nextLetters = makeLetters(next, WORDS[next])

    setShowCursor(false)
    setWritePos(0)

    nextLetters.forEach((letter, i) =>
      addTimer(i * 85, () => {
        setLetters(prev => {
          const updated = [...prev]
          updated[i] = letter
          return updated
        })
        setWritePos(i + 1)
        if (i === 0) setShowCursor(true)
      })
    )

    const writeEnd = nextLetters.length * 85
    addTimer(writeEnd + 50,   () => setLetters(nextLetters))
    addTimer(writeEnd + 300,  () => setShowCursor(false))
    addTimer(writeEnd + 3000, () => cycle(next))
  }

  useEffect(() => {
    if (!loaded) return

    const first = makeLetters(0, WORDS[0])
    setShowCursor(true)
    setWritePos(0)
    first.forEach((l, i) => addTimer(200 + i * 85, () => {
      setWritePos(i + 1)
      setLetters(p => [...p, l])
    }))

    const end = 200 + (first.length - 1) * 85
    addTimer(end + 200, () => setShowCursor(false))
    addTimer(end + 2200, () => cycle(0))

    return clearAllTimers
  }, [loaded])

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section id="hero-section" className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between bg-navy px-6 md:px-10 pt-8 pb-8 overflow-hidden">

        <HeroCanvas isMuted={isMuted} volume={volume} />

        {/* Sound toggle + volume slider */}
        <div className="absolute bottom-8 right-6 md:right-10 z-50 flex flex-col items-center gap-3 pointer-events-auto">
          {!isMuted && (
            <div style={{ height: 80, width: 36, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <input
                type="range"
                min="0" max="1" step="0.01"
                value={volume}
                onChange={e => setVolume(parseFloat(e.target.value))}
                className="volume-slider"
                style={{
                  width: 80,
                  position: 'absolute',
                  transform: 'rotate(-90deg)',
                }}
              />
            </div>
          )}
          <button
            onClick={() => setIsMuted(m => !m)}
            className="w-9 h-9 rounded-full border border-paper/30 flex items-center justify-center text-paper/60 hover:text-paper hover:border-paper/60 transition-colors"
            aria-label={isMuted ? 'Ativar som' : 'Silenciar'}
          >
            {isMuted ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <line x1="23" y1="9" x2="17" y2="15"/>
                <line x1="17" y1="9" x2="23" y2="15"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
              </svg>
            )}
          </button>
        </div>

        <div className="relative z-30 flex-1 flex flex-col justify-start md:justify-center">
          <h1 className="font-body font-black text-paper leading-[0.88] lowercase tracking-tighter"
              style={{ fontSize: 'clamp(4.5rem, 18vw, 15rem)', height: '1.76em' }}>
            <span style={{ display: 'block' }}>bruno</span>
            <span style={{ display: 'block', whiteSpace: 'nowrap', minHeight: '0.88em' }}>
            {(() => {
              const cursor = showCursor ? (
                <span key="cursor" style={{
                  display: 'inline-block',
                  width: 0,
                  height: '0.88em',
                  verticalAlign: 'text-bottom',
                  borderLeft: '3px solid #FFFEFE',
                  marginRight: '-3px',
                  opacity: cursorOn ? 1 : 0,
                  transition: 'opacity 0.1s',
                }} />
              ) : null

              const items = []
              letters.forEach((l, i) => {
                if (showCursor && writePos === i) items.push(cursor)
                items.push(
                  <span key={l.key} className={l.signal ? 'text-signal' : ''} style={{ opacity: 1, animation: 'letter-appear 0.3s ease-out' }}>
                    {l.char}
                  </span>
                )
              })
              if (showCursor && writePos >= letters.length) items.push(cursor)
              return items
            })()}
            </span>
          </h1>
          <p className="font-editorial italic text-paper/80 mt-6 md:mt-12 leading-snug"
             style={{ fontSize: 'clamp(1rem, 2vw, 1.5rem)', maxWidth: '42rem' }}>
            Quem não aparece, não é lembrado. Você merece ser visto em sua melhor versão.
          </p>
        </div>

        <div className="relative z-10">
          <p className="font-body text-[10px] tracking-[.12em] uppercase text-paper/30">
            OBRUNOEDITA © TODOS OS DIREITOS RESERVADOS
          </p>
        </div>

        {/* Mask: fades the bottom of the hero full-width */}
        <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-navy to-transparent pointer-events-none z-20" />

        <div className="absolute bottom-0 left-0 right-0 h-px bg-paper/10" />
      </section>

      {/* ── CLIENT STRIP ─────────────────────────────────────── */}
      <ClientStrip />

      {/* ── WORK PREVIEW ─────────────────────────────────────── */}
      <section className="px-6 md:px-10 py-16 md:py-20">
        <div className="mb-10">
          <h2 className="font-editorial text-paper/90 text-2xl md:text-3xl italic">
            trabalho recente
          </h2>
        </div>

        <Carousel opts={{ align: 'center', containScroll: false, loop: true }}>
          <CarouselContent>
            {projects.map((project) => (
              <CarouselItem key={project.slug} className="basis-auto">
                <ProjectCard project={project} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="absolute inset-y-0 left-0 w-16 md:w-32 lg:w-48 z-10 pointer-events-none bg-gradient-to-r from-navy to-transparent" />
          <div className="absolute inset-y-0 right-0 w-16 md:w-32 lg:w-48 z-10 pointer-events-none bg-gradient-to-l from-navy to-transparent" />
          <CarouselPrevious className="absolute left-3 top-1/2 -translate-y-1/2 z-20" />
          <CarouselNext className="absolute right-3 top-1/2 -translate-y-1/2 z-20" />
        </Carousel>

        <div className="mt-10">
          <Link
            to="/work"
            className="font-body text-xs tracking-widest uppercase text-signal hover:text-paper transition-colors"
          >
            → ver todo o trabalho
          </Link>
        </div>
      </section>

      {/* ── BELIEF TEASER ────────────────────────────────────── */}
      <section ref={beliefSectionRef} className="border-t border-paper/10 grid md:grid-cols-2 min-h-[100vh]">
        <div className="relative overflow-hidden min-h-[60vh] md:min-h-0 md:h-full">
          <img
            src="/IMG_0353.jpg"
            alt="Bruno"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: '50% -8%' }}
          />
        </div>
        <div className="flex flex-col justify-center gap-8 px-8 md:px-16 py-16">
          <div>
            <h2 className="font-body font-black text-paper text-3xl md:text-4xl leading-[1.15] tracking-tight">
              {splitToChars('Faço vídeos para marcas que levam a própria imagem ')}
              {splitToChars('a sério.', 'text-signal')}
            </h2>
            <div className="mt-4 w-10 h-[2px] bg-signal" />
          </div>

          <div className="space-y-5">
            <p ref={para1Ref} className="font-body text-paper/80 text-sm leading-relaxed">
              Não atendo quem está começando e precisa de volume. Atendo quem já construiu algo com credibilidade real e percebeu que a imagem que mostra pro mundo ainda não está na altura disso.
            </p>
            <p ref={para2Ref} className="font-body text-paper/80 text-sm leading-relaxed">
              <strong className="text-paper font-semibold">O que faço é pensar antes de gravar.</strong> Briefing, estrutura, intenção — isso vem antes da câmera ligar. Porque um vídeo que posiciona uma marca não acontece no set. Acontece antes.
            </p>
            <p ref={para3Ref} className="font-body text-paper/65 text-sm leading-relaxed">
              A imagem que sua marca mostra ao mundo é uma decisão — e a maioria das marcas está tomando essa decisão por padrão.
            </p>
          </div>

          <blockquote ref={blockquoteRef} className="border-l-2 border-signal pl-4">
            <p className="font-body text-paper/80 text-sm leading-relaxed">
              Se você já tem algo a dizer e ainda não está parecendo —{' '}
              <Link to="/contact" className="text-signal hover:text-paper transition-colors">
                me fala.
              </Link>
            </p>
          </blockquote>
        </div>
      </section>

      {/* ── MISSION BLOCK ────────────────────────────────────── */}
      <section className="px-6 md:px-10 py-20 md:py-28 border-t border-paper/10">
        <p className="font-editorial text-paper/90 text-2xl md:text-4xl lg:text-5xl leading-[1.2] max-w-4xl text-balance">
          obrunoedita faz marcas estabelecidas parecerem exatamente o quanto são sérias
          <span className="text-signal">.</span>
        </p>
        <div className="mt-10 flex flex-wrap gap-8 font-body text-[11px] tracking-widest uppercase text-paper/40">
          <span>Planejamento antes do set</span>
          <span className="text-signal/40">✶</span>
          <span>Corte com intenção</span>
          <span className="text-signal/40">✶</span>
          <span>Brand antes de trend</span>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="border-t border-paper/10 px-6 md:px-10 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <AsterMark size={14} color="#FE214D" />
          <span className="font-body text-[10px] font-semibold tracking-widest uppercase text-paper/50">
            oBrunoEdita
          </span>
        </div>
        <p className="font-body text-[10px] tracking-wider text-paper/30 uppercase">
          © {new Date().getFullYear()} · Farroupilha | São Paulo
        </p>
      </footer>
    </>
  )
}
