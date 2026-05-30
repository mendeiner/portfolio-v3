import { useParams, Link, Navigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { projects, categoryLabels } from '../data/projects'
import AsterMark from '../components/AsterMark'
import ProjectCarousel from '../components/ProjectCarousel'

function ProjectSection({ project, sectionRef }) {
  return (
    <section ref={sectionRef} data-slug={project.slug} className="pt-8 pb-10">
      <div className="px-6 md:px-10 pb-10">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-2">
          <span className="font-body text-[10px] tracking-widest uppercase text-signal">
            {categoryLabels[project.category]}
          </span>
          <span className="font-body text-[10px] text-paper/40">·</span>
          <span className="font-body text-[10px] tracking-widest text-paper/40">
            {project.year}
          </span>
        </div>
        <h2 className="font-display text-paper text-4xl md:text-6xl leading-none tracking-tight">
          {project.client}
        </h2>
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
    </section>
  )
}

export default function WorkDetail() {
  const { slug } = useParams()
  const startIdx = projects.findIndex((p) => p.slug === slug)

  if (startIdx === -1) return <Navigate to="/work" replace />

  const [loadedProjects, setLoadedProjects] = useState([projects[startIdx]])
  const sectionRefs = useRef([])
  const sentinelRef = useRef(null)
  const loadingRef = useRef(false)

  // Reset loading guard after each successful append
  useEffect(() => {
    loadingRef.current = false
  }, [loadedProjects.length])

  // Sentinel observer — appends next project when bottom is near
  useEffect(() => {
    const MAX = projects.length * 3
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || loadingRef.current) return
        loadingRef.current = true
        setLoadedProjects((prev) => {
          if (prev.length >= MAX) return prev
          const nextIdx = (startIdx + prev.length) % projects.length
          return [...prev, projects[nextIdx]]
        })
      },
      { rootMargin: '300px' }
    )

    if (sentinelRef.current) observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [startIdx])

  // URL tracking — silently updates address bar as each project enters view
  useEffect(() => {
    const refs = sectionRefs.current.filter(Boolean)
    if (!refs.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting)
            window.history.replaceState(null, '', `/work/${e.target.dataset.slug}`)
        })
      },
      { rootMargin: '0px 0px -70% 0px', threshold: 0 }
    )

    refs.forEach((ref) => observer.observe(ref))
    return () => observer.disconnect()
  }, [loadedProjects])

  return (
    <div className="min-h-screen bg-navy">
      <div className="px-6 md:px-10 pt-10 pb-2">
        <Link
          to="/work"
          className="font-body text-[10px] tracking-widest uppercase text-paper/50 hover:text-paper transition-colors"
        >
          ← trabalho
        </Link>
      </div>

      {loadedProjects.map((project, i) => (
        <ProjectSection
          key={`${project.slug}-${i}`}
          project={project}
          sectionRef={(el) => (sectionRefs.current[i] = el)}
        />
      ))}

      <div ref={sentinelRef} className="h-1" />
    </div>
  )
}
