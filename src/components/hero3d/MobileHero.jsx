import { useContext, useRef, useEffect } from 'react'
import { LoadingContext } from '../../App'

// Screen bounds within the hand-phone.png (as % of the PNG's intrinsic 1:1 frame).
// Captured from the ExportHand tool.
const SCREEN_BOUNDS = {
  top: '10.198%',
  left: '36.369%',
  width: '37.248%',
  height: '65.722%',
}

// Square frame. Capped at 65vh on mobile (bottom-center), 85vh on desktop
// (bottom-right). translate-y-[8%] pushes the hand slightly below the hero
// baseline so it reads as anchored to the bottom edge.
// translate-y-[8%] is intentionally excluded here — the hand-slide-up
// animation handles the final resting offset via fill-mode:both.
// Before loading, translate-y-full keeps it offscreen so the animation
// start state matches with no visible jump.
const FRAME_BASE =
  'relative w-full aspect-square max-h-[65vh] max-w-[65vh] ' +
  'md:max-h-[85vh] md:max-w-[85vh]'

const WRAPPER_CLASS =
  'absolute inset-0 flex items-end justify-center ' +
  'md:justify-end md:pr-8 lg:pr-16 overflow-hidden'

export function MobileHero({ isMuted, volume }) {
  const videoRef = useRef(null)
  const loaded = useContext(LoadingContext)
  const frameClass = loaded ? `${FRAME_BASE} hand-slide-up` : `${FRAME_BASE} translate-y-full`

  // Ref callback runs SYNCHRONOUSLY when the <video> mounts. Mobile autoplay
  // policies decide "muted vs unmuted" the moment src starts loading, so we
  // must set muted BEFORE src. React's JSX renders src first (as attribute)
  // and muted second (as property), which is the wrong order — we work
  // around that by leaving src out of the JSX entirely and assigning it here.
  const setVideoRef = (el) => {
    videoRef.current = el
    if (!el) return
    // Muted state, set first via both attribute and property.
    el.muted = true
    el.defaultMuted = true
    el.setAttribute('muted', '')
    // Inline playback (no fullscreen takeover on iOS).
    el.playsInline = true
    el.setAttribute('playsinline', '')
    el.setAttribute('webkit-playsinline', '')
    el.setAttribute('autoplay', '')
    el.loop = true
    el.preload = 'auto'
    // src set LAST — after muted is committed — so the browser's autoplay
    // decision is based on a muted element.
    if (el.src !== window.location.origin + '/videos/reel.webm') {
      el.src = '/videos/reel.webm'
    }
    const tryPlay = () => el.play().catch(() => {})
    tryPlay()
    el.addEventListener('canplay', tryPlay, { once: true })
  }

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = isMuted
    v.volume = isMuted ? 0 : (volume ?? 0.8)
    v.play().catch(() => {})
  }, [isMuted, volume])

  // Fallback: if autoplay was blocked (e.g. iOS Low Power Mode), the FIRST
  // user gesture anywhere on the page will start playback. This is what
  // makes the volume-button click work today — we generalize it to any tap.
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
      {/* Backdrop: hand+phone PNG + video. Sits behind hero text (z-30). */}
      <div className={WRAPPER_CLASS} style={{ zIndex: 0 }}>
        <div className={frameClass}>
          <img
            src="/images/hand-phone.png"
            alt=""
            className="absolute inset-0 w-full h-full object-contain"
            loading="eager"
            decoding="async"
          />
          <video
            ref={setVideoRef}
            src="/videos/reel.webm"
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
            }}
          />
        </div>
      </div>

      {/* Foreground: hand-only cutout. Sits IN FRONT of hero text (z-30),
          so the fingers/thumb visually wrap over both the video and the text. */}
      <div className={WRAPPER_CLASS} style={{ zIndex: 40 }}>
        <div className={frameClass}>
          <img
            src="/images/hand.png"
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
