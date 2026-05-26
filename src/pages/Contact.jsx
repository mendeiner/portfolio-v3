import AsterMark from '../components/AsterMark'

export default function Contact() {
  return (
    <div className="min-h-screen bg-navy flex flex-col">

      {/* ── MAIN CTA ─────────────────────────────────────────── */}
      <section className="flex-1 flex flex-col justify-center px-6 md:px-10 py-20">
        <div className="max-w-2xl">
          <AsterMark size={48} color="#FE214D" className="mb-10" />

          <p className="font-editorial text-paper/90 text-2xl md:text-3xl lg:text-4xl italic leading-[1.3] text-balance mb-10">
            Se sua marca já tem algo a dizer e ainda não está parecendo —
          </p>

          <a
            href="mailto:contato@obrunoedita.com"
            className="inline-block font-body font-semibold text-sm tracking-widest uppercase px-8 py-4 bg-paper text-navy hover:bg-signal hover:text-paper transition-colors duration-200"
          >
            me fala →
          </a>
        </div>
      </section>

      {/* ── NOT FOR ──────────────────────────────────────────── */}
      <section className="px-6 md:px-10 py-16 border-t border-paper/10 grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="font-body text-[10px] tracking-widest uppercase text-paper/40 mb-6">
            para quem é
          </h2>
          <ul className="space-y-3 font-body text-sm text-paper/70 leading-relaxed">
            {[
              'Marcas com algo real a mostrar',
              'Negócios que pensam em anos, não em posts',
              'Quem quer posicionamento, não volume',
              'Quem entende que o briefing é o trabalho',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="text-signal text-xs mt-0.5">→</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-body text-[10px] tracking-widest uppercase text-paper/40 mb-6">
            não é para
          </h2>
          <ul className="space-y-3 font-body text-sm text-paper/50 leading-relaxed">
            {[
              'Quem quer volume antes de estratégia',
              'Quem negocia orçamento antes de entender valor',
              'Quem acha que boa câmera resolve',
              'Quem pula o briefing e improvisa no set',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="text-crimson/70 text-xs mt-0.5">×</span>
                {item}
              </li>
            ))}
          </ul>
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
        <p className="font-body text-[10px] tracking-wider text-paper/30">
          Farroupilha · RS · Brasil
        </p>
      </footer>
    </div>
  )
}
