import { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { useVolume } from '../context/VolumeContext'
import { categoryLabels } from '../data/projects'
import {
  loadScores, saveScores, getLikes, recordLike,
  buildFeed, injectMore, deprioritize,
  recordWatchtime, debugInfo, DEFAULT_SCORE,
  fetchServerLikes, postServerLike,
} from '../utils/reelAlgorithm'

const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

// ── ReelItem ─────────────────────────────────────────────────────────────────

function ReelItem({
  item, index, onVideoEl, volume, setVolume, isMuted, setIsMuted,
  onClose, showHint, hintFading, onLike, liked, likeCount,
}) {
  const videoRef = useRef(null)
  const [isPaused, setIsPaused] = useState(false)
  const [flashIcon, setFlashIcon] = useState(null)
  const flashTimer = useRef(null)

  const setRef = useCallback((el) => {
    videoRef.current = el
    onVideoEl(index, el)
  }, [index, onVideoEl])

  const togglePlay = () => {
    const vid = videoRef.current
    if (!vid) return
    const icon = vid.paused ? 'play' : 'pause'
    vid.paused ? vid.play() : vid.pause()
    setFlashIcon(icon)
    clearTimeout(flashTimer.current)
    flashTimer.current = setTimeout(() => setFlashIcon(null), 700)
  }

  return (
    <div
      className="reel-item relative flex items-center justify-center"
      style={{ height: '100dvh', width: '100%' }}
    >
      {/* Scroll hint — in the navy area below the video box */}
      {showHint && (
        <div
          className={`absolute bottom-5 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-1 pointer-events-none
            transition-opacity duration-500 ${hintFading ? 'opacity-0' : 'opacity-100'}`}
        >
          <svg
            className="animate-bounce-arrow text-paper/80"
            width="26" height="26"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
          <span className="font-body text-[10px] tracking-widest uppercase text-paper/60">
            {isTouch ? 'deslize' : 'scroll'}
          </span>
        </div>
      )}

      {/* 9:16 container — signal border, like the existing lightbox */}
      <div
        className="relative border-2 border-signal overflow-hidden cursor-pointer bg-black"
        style={{ height: 'min(90dvh, calc(100vw * 16 / 9))', aspectRatio: '9/16' }}
        onClick={togglePlay}
      >
        <video
          ref={setRef}
          data-reel-index={index}
          src={item.videoSrc}
          loop
          playsInline
          preload="none"
          onPlay={() => setIsPaused(false)}
          onPause={() => setIsPaused(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-10" />

        {/* Flash icon */}
        {flashIcon && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="w-16 h-16 rounded-full bg-black/40 flex items-center justify-center animate-ping-once">
              {flashIcon === 'pause' ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
              )}
            </div>
          </div>
        )}

        {/* Persistent pause indicator */}
        {isPaused && !flashIcon && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="w-14 h-14 rounded-full border border-paper/40 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(255,254,254,0.7)">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            </div>
          </div>
        )}

        {/* Close button */}
        <button
          onClick={(e) => { e.stopPropagation(); onClose() }}
          className="absolute top-3 right-3 z-30 w-9 h-9 flex items-center justify-center text-paper/70 hover:text-paper text-2xl leading-none"
          aria-label="Fechar"
        >
          ×
        </button>

        {/* Right column: logo + like + volume */}
        <div
          className="absolute right-3 bottom-20 z-20 flex flex-col items-center gap-4"
          onClick={e => e.stopPropagation()}
        >
          {/* Project logo — navigate to full project */}
          <Link
            to={`/work/${item.project.slug}`}
            onClick={onClose}
            className="block w-11 h-11 rounded-full border-2 border-paper/50 overflow-hidden bg-navy hover:border-signal transition-colors"
            aria-label={item.project.client}
          >
            <img
              src={item.project.logo}
              alt={item.project.client}
              className="w-full h-full object-contain p-1 brightness-0 invert"
            />
          </Link>

          {/* ❤️ Like button + count — one like per session */}
          <button
            onClick={liked ? undefined : () => onLike(item.project.slug)}
            aria-label="Curtir"
            disabled={liked}
            className={`flex flex-col items-center gap-0.5 transition-opacity ${liked ? 'opacity-100 cursor-default' : 'opacity-80 hover:opacity-100'}`}
          >
            <svg
              width="22" height="22" viewBox="0 0 24 24"
              fill={liked ? '#FE214D' : 'none'}
              stroke={liked ? '#FE214D' : 'rgba(255,254,254,0.65)'}
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {likeCount > 0 && (
              <span className="font-body text-[10px] text-paper/60 leading-none">
                {likeCount > 999 ? `${Math.floor(likeCount / 1000)}k` : likeCount}
              </span>
            )}
          </button>

          {/* Volume slider — hidden when muted */}
          {!isMuted && (
            <div
              style={{ height: 80, width: 36, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const ratio = 1 - (e.clientY - rect.top) / rect.height
                setVolume(Math.max(0, Math.min(1, ratio)))
              }}
            >
              <input
                type="range"
                min="0" max="1" step="0.01"
                value={volume}
                onChange={e => setVolume(parseFloat(e.target.value))}
                className="volume-slider"
                style={{ width: 80, position: 'absolute', transform: 'rotate(-90deg)' }}
              />
            </div>
          )}
          {/* Mute toggle button */}
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

        {/* Bottom left: client name + category */}
        <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
          <p className="font-display text-paper text-xl leading-none tracking-tight">
            {item.project.client}
          </p>
          <p className="font-body text-[10px] tracking-widest uppercase text-paper/60 mt-1">
            {categoryLabels[item.project.category]}
          </p>
        </div>
      </div>
    </div>
  )
}

// ── ReelModal ─────────────────────────────────────────────────────────────────

export default function ReelModal({ feed: initialFeed, startIndex, onClose }) {
  const scrollRef          = useRef(null)
  const videoEls           = useRef([])
  const feedRef            = useRef([])
  const watchProgress      = useRef({})
  const timeupdateHandlers = useRef({})
  const observerRef        = useRef(null)    // stable observer, populated on mount
  const currentIndexRef = useRef(startIndex) // mirrors currentIndex for observer

  const { volume, setVolume } = useVolume()
  const [isMuted, setIsMuted] = useState(false)
  const isMutedRef = useRef(false)
  useEffect(() => { isMutedRef.current = isMuted }, [isMuted])

  // ── Feed state (dynamic, built from scores) ─────────────────────────────────
  const [feed, setFeed] = useState(() => {
    const scores = loadScores()
    return buildFeed(initialFeed, scores)
  })

  // Find the effective start index in the sorted feed (same slug as original click)
  const effectiveStart = (() => {
    const targetSlug = initialFeed[startIndex]?.project.slug
    const idx = feed.findIndex(item => item.project.slug === targetSlug)
    return idx !== -1 ? idx : 0
  })()

  useEffect(() => { feedRef.current = feed }, [feed])

  // ── Liked slugs + server like counts ───────────────────────────────────────
  const likedSlugsRef = useRef(new Set())
  const [likedSlugs, setLikedSlugs] = useState(() => {
    const likes = getLikes()
    const initial = new Set(Object.keys(likes).filter(k => likes[k] > 0))
    likedSlugsRef.current = initial
    return initial
  })
  const [likeCounts, setLikeCounts] = useState({})

  // Keep ref in sync with state (must be AFTER the declarations above)
  useEffect(() => { likedSlugsRef.current = likedSlugs }, [likedSlugs])

  // ── Scroll hint ─────────────────────────────────────────────────────────────
  const [showHint, setShowHint]     = useState(true)
  const [hintFading, setHintFading] = useState(false)
  const hintTimer = useRef(null)

  // ── Collect video DOM elements + observe immediately ───────────────────────
  const handleVideoEl = useCallback((index, el) => {
    const prev = videoEls.current[index]
    if (prev && observerRef.current) observerRef.current.unobserve(prev)
    videoEls.current[index] = el
    if (el && observerRef.current) observerRef.current.observe(el)
  }, [])

  // ── Jump to effective start before first paint ──────────────────────────────
  useLayoutEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = effectiveStart * scrollRef.current.clientHeight
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Lock body scroll ────────────────────────────────────────────────────────
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // ── Preload the starting video immediately so it plays without a loading gap ─
  useEffect(() => {
    const vid = videoEls.current[effectiveStart]
    if (vid && vid.preload !== 'auto') {
      vid.preload = 'auto'
      vid.load()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch server like counts on mount ───────────────────────────────────────
  useEffect(() => {
    fetchServerLikes().then(counts => {
      if (counts && typeof counts === 'object') setLikeCounts(counts)
    })
  }, [])

  // ── Keyboard navigation ─────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        scrollRef.current?.scrollBy({ top: scrollRef.current.clientHeight, behavior: 'smooth' })
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        scrollRef.current?.scrollBy({ top: -scrollRef.current.clientHeight, behavior: 'smooth' })
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // ── Preloading: fetch() range request — warms HTTP cache, never touches video elements
  const [currentIndex, setCurrentIndex] = useState(effectiveStart)
  useEffect(() => {
    // Preload next 2 video elements directly — the only reliable way to buffer video
    ;[currentIndex + 1, currentIndex + 2].forEach(i => {
      const vid = videoEls.current[i]
      if (vid && vid.preload !== 'auto') {
        vid.preload = 'auto'
        vid.load()
      }
    })
  }, [currentIndex, feed])

  // ── Volume sync ─────────────────────────────────────────────────────────────
  useEffect(() => {
    videoEls.current.forEach(v => { if (v) v.volume = isMuted ? 0 : volume })
  }, [volume, isMuted])

  // ── IntersectionObserver: created once on mount, videos self-register ────────
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const idx = parseInt(entry.target.dataset.reelIndex, 10)
        const vid = videoEls.current[idx]
        if (!vid) return

        if (entry.isIntersecting) {
          currentIndexRef.current = idx
          vid.currentTime = 0  // reset here — video is about to play, not while still visible
          watchProgress.current[idx] = { accumulated: 0, lastTime: null, reported: false, algoProcessed: false }
          vid.volume = isMutedRef.current ? 0 : volume
          vid.play().catch(() => {})
          setCurrentIndex(idx)
        } else {
          vid.pause()  // stop only — no reset while still partially in view during scroll

          const wp = watchProgress.current[idx]
          if (wp && !wp.algoProcessed) {
            wp.algoProcessed = true
            const duration = vid.duration
            const pct = duration ? Math.min(1, wp.accumulated / duration) : 0
            const slug = feedRef.current[idx]?.project.slug
            if (slug) {
              const scores = loadScores()
              const { updated, trigger } = recordWatchtime(slug, pct, scores)
              saveScores(updated)
              if (trigger === 'most') {
                const { newFeed } = injectMore(slug, feedRef.current, idx)
                setFeed(newFeed)
              } else if (trigger === 'little') {
                const newFeed = deprioritize(slug, feedRef.current, idx)
                setFeed(newFeed)
              }
            }
          }
        }
      })
    }, { threshold: 0.6 })

    observerRef.current = observer
    // Observe any videos already registered before this effect ran
    videoEls.current.forEach(v => { if (v) observer.observe(v) })

    return () => {
      observer.disconnect()
      observerRef.current = null
      // Flush watchtime for the currently playing video on reel close
      const idx = currentIndexRef.current
      const wp = watchProgress.current[idx]
      if (wp && !wp.algoProcessed) {
        wp.algoProcessed = true
        const duration = wp.duration ?? videoEls.current[idx]?.duration
        const pct = duration ? Math.min(1, wp.accumulated / duration) : 0
        const slug = feedRef.current[idx]?.project.slug
        if (slug) {
          const scores = loadScores()
          const { updated } = recordWatchtime(slug, pct, scores)
          saveScores(updated)
        }
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── timeupdate listeners: accumulate forward-only watch progress ────────────
  useEffect(() => {
    const tid = setTimeout(() => {
      videoEls.current.forEach((vid, idx) => {
        if (!vid) return
        // Remove old handler if any
        if (timeupdateHandlers.current[idx]) {
          vid.removeEventListener('timeupdate', timeupdateHandlers.current[idx])
        }
        const handler = () => {
          const wp = watchProgress.current[idx]
          if (!wp || wp.reported) return
          const duration = vid.duration
          if (!duration) return
          if (!wp.duration) wp.duration = duration  // cache for use at unmount
          // Only accumulate forward progress (handles loop resets)
          if (wp.lastTime !== null && vid.currentTime > wp.lastTime) {
            wp.accumulated += vid.currentTime - wp.lastTime
          }
          wp.lastTime = vid.currentTime
          if (wp.accumulated >= duration) wp.reported = true
        }
        timeupdateHandlers.current[idx] = handler
        vid.addEventListener('timeupdate', handler)
      })
    }, 0)

    return () => {
      clearTimeout(tid)
      videoEls.current.forEach((vid, idx) => {
        if (vid && timeupdateHandlers.current[idx]) {
          vid.removeEventListener('timeupdate', timeupdateHandlers.current[idx])
        }
      })
    }
  }, [feed.length])

  // ── Scroll hint: auto-hide after 2.5s or first scroll ──────────────────────
  useEffect(() => {
    hintTimer.current = setTimeout(() => {
      setHintFading(true)
      setTimeout(() => setShowHint(false), 500)
    }, 2500)
    return () => clearTimeout(hintTimer.current)
  }, [])

  const handleScroll = useCallback(() => {
    if (!showHint) return
    clearTimeout(hintTimer.current)
    setHintFading(true)
    setTimeout(() => setShowHint(false), 500)
  }, [showHint])

  // ── Like handler ────────────────────────────────────────────────────────────
  const handleLike = useCallback(async (slug) => {
    if (likedSlugsRef.current.has(slug)) return  // already liked this session
    setLikedSlugs(prev => new Set([...prev, slug]))
    setLikeCounts(prev => ({ ...prev, [slug]: (prev[slug] ?? 0) + 1 }))
    // localStorage + score boost
    recordLike(slug)
    const scores = loadScores()
    if (!scores.companies[slug]) {
      scores.companies[slug] = { score: DEFAULT_SCORE, likeCount: 0, mostCount: 0, littleCount: 0, seenCount: 0 }
    }
    scores.companies[slug].score = Math.min(3.0, scores.companies[slug].score + 0.3)
    scores.companies[slug].likeCount += 1
    saveScores(scores)
    // Server write — sync authoritative count back
    const updated = await postServerLike(slug)
    if (updated && typeof updated === 'object') setLikeCounts(updated)
  }, [])

  // ── Debug utility for Bruno ─────────────────────────────────────────────────
  useEffect(() => {
    window.__reelDebug = () => {
      const { scores, likes } = debugInfo()
      const rows = Object.keys({ ...scores.companies, ...likes }).map(slug => ({
        project: slug,
        likes: likes[slug] ?? 0,
        score: (scores.companies?.[slug]?.score ?? DEFAULT_SCORE).toFixed(2),
        mostCount: scores.companies?.[slug]?.mostCount ?? 0,
        littleCount: scores.companies?.[slug]?.littleCount ?? 0,
        seenCount: scores.companies?.[slug]?.seenCount ?? 0,
      }))
      console.table(rows)
    }
    return () => { delete window.__reelDebug }
  }, [])

  // ── Render ──────────────────────────────────────────────────────────────────
  return createPortal(
    <div className="fixed inset-0 z-[70]">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          height: '100dvh',
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          WebkitOverflowScrolling: 'touch',
          backgroundColor: 'rgba(1, 34, 77, 0.75)',
          willChange: 'scroll-position',
        }}
      >
        {feed.map((item, i) => (
          <ReelItem
            key={`${item.videoSrc}-${i}`}
            item={item}
            index={i}
            onVideoEl={handleVideoEl}
            volume={volume}
            setVolume={setVolume}
            isMuted={isMuted}
            setIsMuted={setIsMuted}
            onClose={onClose}
            showHint={showHint && i === effectiveStart}
            hintFading={hintFading}
            onLike={handleLike}
            liked={likedSlugs.has(item.project.slug)}
            likeCount={likeCounts[item.project.slug] ?? 0}
          />
        ))}
      </div>
    </div>,
    document.body
  )
}
