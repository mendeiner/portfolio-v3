import { Link } from 'react-router-dom'
import AsterMark from '../components/AsterMark'

export default function About() {
  return (
    <div className="min-h-screen bg-navy">

      {/* ── PULL QUOTE ───────────────────────────────────────── */}
      <section className="px-6 md:px-10 pt-16 pb-12 border-b border-paper/10 max-w-4xl">
        <p className="font-editorial text-paper/90 text-2xl md:text-3xl lg:text-4xl italic leading-[1.35] text-balance">
          "Qualquer um grava. Poucos decidem o que a imagem vai afirmar antes de apertar o botão."
        </p>
      </section>

      {/* ── YEAR AS IMAGE ────────────────────────────────────── */}
      <section className="px-6 md:px-10 py-14">
        <p className="font-body text-[10px] tracking-widest uppercase text-paper/40 mb-3">
          desde
        </p>
        <p className="font-display text-paper leading-none text-[clamp(5rem,18vw,14rem)] tracking-tight">
          2012<span className="text-signal">.</span>
        </p>
      </section>

      {/* ── BIO ──────────────────────────────────────────────── */}
      <section className="px-6 md:px-10 pb-16 border-t border-paper/10 grid md:grid-cols-2 gap-12 pt-14">
        <div className="space-y-5">
          <p className="font-body text-paper/80 text-sm leading-relaxed">
            Bruno edita desde os 13 anos. Não por acidente — por escolha. Hoje trabalha com marcas que já têm algo real a mostrar e ainda não estão parecendo. Cuida do enquadramento, do corte, do que vem antes da câmera ligar.
          </p>
          <p className="font-body text-paper/65 text-sm leading-relaxed">
            Porque um vídeo que posiciona uma marca começa muito antes do set. O problema nunca é gravar. É o que você decidiu dizer, como decidiu parecer, o que a imagem está afirmando sobre o valor do que você faz.
          </p>
          <p className="font-body text-paper/65 text-sm leading-relaxed">
            A imagem que sua marca mostra ao mundo é uma decisão — e a maioria das marcas está tomando essa decisão por padrão.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {[
            { number: '13', label: 'anos editando' },
            { number: '10+', label: 'anos em set' },
            { number: 'RS', label: 'Farroupilha · base' },
          ].map(({ number, label }) => (
            <div key={label} className="flex items-baseline gap-4 border-b border-paper/10 pb-6">
              <span className="font-display text-paper text-4xl md:text-5xl leading-none">
                {number}
              </span>
              <span className="font-body text-[10px] tracking-widest uppercase text-paper/50">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── BELIEFS ──────────────────────────────────────────── */}
      <section className="px-6 md:px-10 py-16 border-t border-paper/10">
        <h2 className="font-body text-[10px] tracking-widest uppercase text-paper/40 mb-10">
          o que fica claro no set
        </h2>
        <div className="space-y-0">
          {[
            'Planejamento é o trabalho. O set é onde o planejamento fica visível.',
            'Cinematic não é estética — é padrão.',
            'Sua imagem é uma declaração de auto-respeito.',
            'Menos, melhor. Um vídeo que posiciona vale mais do que dez que não posicionam.',
            'Brand antes de trend.',
          ].map((belief, i) => (
            <div
              key={i}
              className="flex items-start gap-6 py-5 border-b border-paper/10"
            >
              <span className="font-body text-[10px] text-paper/30 mt-0.5 shrink-0 w-5">
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="font-body text-paper/80 text-sm leading-relaxed">
                {belief}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="px-6 md:px-10 py-20 flex flex-col sm:flex-row items-start sm:items-center gap-8 border-t border-paper/10">
        <AsterMark size={40} color="#FE214D" />
        <div>
          <p className="font-editorial text-paper/85 text-xl italic">
            Se sua marca já tem algo a dizer e ainda não está parecendo
          </p>
          <Link
            to="/contact"
            className="inline-block mt-3 font-body text-xs tracking-widest uppercase text-signal hover:text-paper transition-colors"
          >
            → me fala
          </Link>
        </div>
      </section>

    </div>
  )
}
