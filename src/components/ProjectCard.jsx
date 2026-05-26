import { Link } from 'react-router-dom'
import { useRef, useEffect } from 'react'

const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

export default function ProjectCard({ project }) {
  const videoRef = useRef(null)

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play()
    }
  }

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }

  useEffect(() => {
    if (!isTouch || !videoRef.current || !project.videoSrc) return
    const video = videoRef.current
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {})
        } else {
          video.pause()
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [project.videoSrc])

  return (
    <Link
      to={`/work/${project.slug}`}
      className="group block relative h-[60vh] w-auto aspect-reel border-2 border-crimson overflow-hidden bg-navy hover:border-signal transition-colors duration-300"
      onMouseEnter={!isTouch ? handleMouseEnter : undefined}
      onMouseLeave={!isTouch ? handleMouseLeave : undefined}
    >
      {project.videoSrc ? (
        <video
          ref={videoRef}
          src={project.videoSrc}
          muted
          loop
          playsInline
          preload="metadata"
          onLoadedMetadata={() => { if (videoRef.current) videoRef.current.currentTime = 3 }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : project.thumbnail ? (
        <img
          src={project.thumbnail}
          alt={project.client}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-plum via-plum/80 to-crimson/30" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex items-end justify-between gap-2">
          <span className="font-body font-bold text-signal text-sm uppercase tracking-wide leading-none">
            {project.client}
          </span>
          <span className="text-paper/60 text-lg leading-none group-hover:text-signal transition-colors">
            →
          </span>
        </div>
      </div>

      <div className="absolute top-3 right-3 font-body text-[10px] text-paper/50 tracking-widest">
        {project.year}
      </div>
    </Link>
  )
}
