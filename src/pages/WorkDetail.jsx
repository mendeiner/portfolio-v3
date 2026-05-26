import { useParams, Link, Navigate } from 'react-router-dom'
import { projects, categoryLabels } from '../data/projects'
import AsterMark from '../components/AsterMark'
import ProjectCarousel from '../components/ProjectCarousel'

export default function WorkDetail() {
  const { slug } = useParams()
  const project = projects.find((p) => p.slug === slug)

  if (!project) return <Navigate to="/work" replace />

  const idx = projects.findIndex((p) => p.slug === slug)
  const next = projects[(idx + 1) % projects.length]

  return (
    <div className="min-h-screen bg-navy">
      <div className="px-6 md:px-10 pt-10">
        <Link
          to="/work"
          className="font-body text-[10px] tracking-widest uppercase text-paper/50 hover:text-paper transition-colors"
        >
          ← trabalho
        </Link>
      </div>

      <div className="px-6 md:px-10 pt-8 pb-10">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-2">
          <span className="font-body text-[10px] tracking-widest uppercase text-signal">
            {categoryLabels[project.category]}
          </span>
          <span className="font-body text-[10px] text-paper/40">·</span>
          <span className="font-body text-[10px] tracking-widest text-paper/40">
            {project.year}
          </span>
        </div>
        <h1 className="font-display text-paper text-4xl md:text-6xl leading-none tracking-tight">
          {project.client}
        </h1>
        <p className="font-editorial text-paper/75 text-lg italic mt-4 max-w-xl">
          {project.brief}
        </p>
      </div>

      <div className="px-6 md:px-10 pb-16">
        <ProjectCarousel project={project} />
      </div>

      {project.description && (
        <div className="px-6 md:px-10 pb-16 max-w-2xl">
          <div className="border-l-2 border-crimson pl-6">
            <p className="font-body text-paper/70 text-sm leading-relaxed">
              {project.description}
            </p>
          </div>
        </div>
      )}

      <div className="border-t border-paper/10 px-6 md:px-10 py-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AsterMark size={16} color="#FE214D" />
          <span className="font-body text-[10px] tracking-widest uppercase text-paper/40">
            próximo
          </span>
        </div>
        <Link
          to={`/work/${next.slug}`}
          className="group flex items-center gap-3 font-body font-bold text-paper hover:text-signal transition-colors"
        >
          <span className="text-sm uppercase tracking-wide">{next.client}</span>
          <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>
    </div>
  )
}
