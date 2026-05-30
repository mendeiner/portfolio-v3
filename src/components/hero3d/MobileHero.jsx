import { useContext, useRef, useEffect, useCallback } from 'react'
import { LoadingContext } from '../../App'
import { useVolume } from '../../context/VolumeContext'

// Screen bounds within the hand-phone.png (as % of the PNG's intrinsic 1:1 frame).
const SCREEN_BOUNDS = {
  top: '10.198%',
  left: '36.369%',
  width: '37.248%',
  height: '65.722%',
}

const FRAME_BASE =
  'relative h-[65vh] w-[65vh] shrink-0 ' +
  'md:h-auto md:w-full md:aspect-square md:max-h-[102vh] md:max-w-[102vh]'

const WRAPPER_CLASS =
  'absolute inset-0 flex items-end justify-center ' +
  'md:justify-end md:-mr-6 lg:-mr-10 overflow-x-hidden'

function getVideoSrc() {
  const file = window.matchMedia('(max-width: 767px)').matches
    ? 'mobile_reel.webm'
    : 'reel.webm'
  return import.meta.env.BASE_URL + 'videos/' + file + '#t=0.001'
}

export function MobileHero() {
  const videoRef = useRef(null)
  const loaded = useContext(LoadingContext)
  const { isMuted, volume } = useVolume()
  const frameClass = loaded ? `${FRAME_BASE} hand-slide-up` : `${FRAME_BASE} translate-y-full`
  const frameStyle = loaded ? undefined : { transform: 'translateY(100%)' }

  // Ref callback runs SYNCHRONOUSLY when the <video> mounts. Mobile autoplay
  // policies decide "muted vs unmuted" the moment src starts loading, so we
  // must set muted BEFORE src.
  const setVideoRef = useCallback((el) => {
    videoRef.current = el
    if (!el) return
    el.muted = true
    el.defaultMuted = true
    el.setAttribute('muted', '')
    el.playsInline = true
    el.setAttribute('playsinline', '')
    el.setAttribute('webkit-playsinline', '')
    el.setAttribute('autoplay', '')
    el.loop = true
    el.preload = 'auto'
    const fullSrc = getVideoSrc()
    const tryPlay = () => el.play().catch(() => {})
    if (el.src !== window.location.origin + fullSrc) {
      el.src = fullSrc
      el.addEventListener('canplay', tryPlay, { once: true })
    }
    tryPlay()
  }, [])

  const volumeRef = useRef(volume)
  useEffect(() => { volumeRef.current = volume }, [volume])

  // Effect 1: mute/unmute transitions only — touching muted attribute here is safe
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (isMuted) {
      v.muted = true
      v.volume = 0
    } else {
      v.removeAttribute('muted')
      v.muted = false
      v.volume = volumeRef.current
      if (v.paused) v.play().catch(() => {})
    }
  }, [isMuted])

  // Effect 2: volume slider — only sets v.volume, never touches muted attribute
  useEffect(() => {
    const v = videoRef.current
    if (!v || isMuted) return
    v.volume = volume
  }, [volume, isMuted])

  // Pause when hero scrolls out of view, resume when back
  useEffect(() => {
    const section = document.getElementById('hero-section')
    if (!section) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        const v = videoRef.current
        if (!v) return
        if (entry.isIntersecting) {
          v.play().catch(() => {})
        } else {
          v.pause()
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  // Pause on unmount (navigating away)
  useEffect(() => {
    return () => {
      if (videoRef.current) videoRef.current.pause()
    }
  }, [])

  // Swap source when the viewport crosses the mobile breakpoint (rotation, resize)
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)')
    const handleChange = () => {
      const v = videoRef.current
      if (!v) return
      const newSrc = getVideoSrc()
      if (v.src !== window.location.origin + newSrc) {
        v.src = newSrc
        v.load()
        v.play().catch(() => {})
      }
    }
    mql.addEventListener('change', handleChange)
    return () => mql.removeEventListener('change', handleChange)
  }, [])

  // Fallback: first user gesture starts playback if autoplay was blocked
  useEffect(() => {
    const start = () => {
      const v = videoRef.current
      if (v && v.paused) v.play().catch(() => {})
    }
    document.addEventListener('touchstart', start, { once: true, passive: true })
    document.addEventListener('click', start, { once: true })
    return () => {
      document.removeEventListener('touchstart', start)
      document.removeEventListener('click', start)
    }
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      <div className={WRAPPER_CLASS} style={{ zIndex: 0 }}>
        <div className={frameClass} style={frameStyle}>
          <img
            src={`${import.meta.env.BASE_URL}images/hand-phone.png`}
            alt=""
            className="absolute inset-0 w-full h-full object-contain"
            loading="eager"
            decoding="async"
          />
          <video
            ref={setVideoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute"
            style={{
              top: SCREEN_BOUNDS.top,
              left: SCREEN_BOUNDS.left,
              width: SCREEN_BOUNDS.width,
              height: SCREEN_BOUNDS.height,
              objectFit: 'cover',
              borderRadius: '5%',
              overflow: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              willChange: 'transform',
            }}
          />
        </div>
      </div>

      {/* Foreground hand cutout sits in front of hero text (z-30) */}
      <div className={WRAPPER_CLASS} style={{ zIndex: 40 }}>
        <div className={frameClass} style={frameStyle}>
          <img
            src={`${import.meta.env.BASE_URL}images/hand.png`}
            alt=""
            className="absolute inset-0 w-full h-full object-contain"
            loading="eager"
            decoding="async"
          />
        </div>
      </div>
    </div>
  )
}
