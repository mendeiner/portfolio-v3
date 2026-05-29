import { useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from './ui/carousel'
import { useVolume } from '../context/VolumeContext'

const isHorizontalFile = (src) => src && /1080/i.test(src)

const thumbSrc = (videoSrc) =>
  videoSrc ? videoSrc.replace('/videos/', '/thumbnails/').replace(/\.webm$/, '.jpg') : null

function VideoCard({ videoSrc, index, horizontal, onHover }) {
  const videoRef = useRef(null)
  const [thumbError, setThumbError] = useState(false)

  const handleThumbError = () => {
    setThumbError(true)
    if (videoRef.current) {
      videoRef.current.preload = 'metadata'
      videoRef.current.load()
    }
  }

  return (
    <div
      className={`group relative h-[60vh] w-auto border-2 border-crimson overflow-hidden bg-navy hover:border-signal transition-colors duration-300 cursor-pointer ${horizontal ? 'aspect-video' : 'aspect-reel'}`}
      onClick={() => onHover({ videoSrc, index })}
    >
      {videoSrc ? (
        <>
          <video
            ref={videoRef}
            src={videoSrc}
            muted
            loop
            playsInline
            preload="none"
            onLoadedMetadata={() => { if (videoRef.current) videoRef.current.currentTime = 1 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {!thumbError && (
            <img
              src={thumbSrc(videoSrc)}
              onError={handleThumbError}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          )}
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-plum via-plum/80 to-crimson/30" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
      <div className="absolute top-3 right-3 font-body text-[10px] text-paper/50 tracking-widest">
        {String(index + 1).padStart(2, '0')}
      </div>
    </div>
  )
}

export default function ProjectCarousel({ project }) {
  const slides = project.slides?.length
    ? project.slides
    : [{ vimeoId: project.vimeoId, videoSrc: project.videoSrc }]

  const single = slides.length === 1
  const [hovered, setHovered] = useState(null)
  const { volume, setVolume } = useVolume()
  const [isPlaying, setIsPlaying] = useState(true)
  const [flashIcon, setFlashIcon] = useState(null)
  const [isLandscape, setIsLandscape] = useState(false)
  const [thumbVisible, setThumbVisible] = useState(false)
  const expandedRef = useRef(null)
  const flashTimer = useRef(null)

  useEffect(() => {
    const vid = expandedRef.current
    if (!vid || !hovered?.videoSrc) return
    setIsLandscape(false)
    setThumbVisible(true)
    vid.volume = volume
    vid.play().catch(() => {})
    setIsPlaying(true)
  }, [hovered])

  useEffect(() => {
    if (expandedRef.current) expandedRef.current.volume = volume
  }, [volume])

  const togglePlay = (e) => {
    e.stopPropagation()
    const vid = expandedRef.current
    if (!vid) return
    if (vid.paused) {
      vid.play()
      setIsPlaying(true)
      setFlashIcon('play')
    } else {
      vid.pause()
      setIsPlaying(false)
      setFlashIcon('pause')
    }
    clearTimeout(flashTimer.current)
    flashTimer.current = setTimeout(() => setFlashIcon(null), 700)
  }

  const handleMetadata = () => {
    const vid = expandedRef.current
    if (vid) setIsLandscape(vid.videoWidth > vid.videoHeight)
  }

  return (
    <>
      {hovered && createPortal(
        <div
          className="fixed inset-0 z-[60] bg-black/70"
          onClick={() => setHovered(null)}
        >
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3"
            onClick={e => e.stopPropagation()}
          >
            {/* Prev arrow */}
            <button
              className={`w-10 h-10 rounded-full border border-paper/30 flex items-center justify-center text-paper/60 hover:text-paper hover:border-paper/60 transition-colors ${hovered.index === 0 ? 'opacity-0 pointer-events-none' : ''}`}
              onClick={e => {
                e.stopPropagation()
                const prev = slides[hovered.index - 1]
                setHovered({ videoSrc: prev.videoSrc, index: hovered.index - 1 })
              }}
            >←</button>

            {/* Video */}
            <div
              className="relative border-2 border-signal overflow-hidden cursor-pointer"
              style={
                isLandscape
                  ? { height: 'min(65vh, calc(90vw * 9 / 16))', aspectRatio: '16/9' }
                  : { height: '82vh', aspectRatio: '9/16' }
              }
              onClick={togglePlay}
            >
              <video
                ref={expandedRef}
                key={hovered.videoSrc}
                src={hovered.videoSrc}
                loop
                playsInline
                preload="auto"
                onLoadedMetadata={handleMetadata}
                onPlaying={() => setThumbVisible(false)}
                className="absolute inset-0 w-full h-full object-contain"
              />
              <img
                src={thumbSrc(hovered.videoSrc)}
                className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-opacity duration-500"
                style={{ opacity: thumbVisible ? 1 : 0 }}
              />

              {flashIcon && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
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

              {!isPlaying && !flashIcon && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-14 h-14 rounded-full border border-paper/40 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(255,254,254,0.7)">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                  </div>
                </div>
              )}

              {/* Volume slider */}
              <div className="absolute bottom-6 right-4 flex flex-col items-center gap-2 z-10" onClick={e => e.stopPropagation()}>
                <div style={{ height: 80, width: 36, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <input
                    type="range"
                    min="0" max="1" step="0.01"
                    value={volume}
                    onChange={e => setVolume(parseFloat(e.target.value))}
                    className="volume-slider"
                    style={{ width: 80, position: 'absolute', transform: 'rotate(-90deg)' }}
                  />
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,254,254,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                </svg>
              </div>
            </div>

            {/* Next arrow */}
            <button
              className={`w-10 h-10 rounded-full border border-paper/30 flex items-center justify-center text-paper/60 hover:text-paper hover:border-paper/60 transition-colors ${hovered.index === slides.length - 1 ? 'opacity-0 pointer-events-none' : ''}`}
              onClick={e => {
                e.stopPropagation()
                const next = slides[hovered.index + 1]
                setHovered({ videoSrc: next.videoSrc, index: hovered.index + 1 })
              }}
            >→</button>
          </div>
        </div>,
        document.body
      )}

      <Carousel opts={{ loop: false, align: 'start', containScroll: false }} className="w-full">
        <CarouselContent className="-ml-4">
          {slides.map((slide, i) => (
            <CarouselItem key={i} className="pl-4 basis-auto">
              <VideoCard
                videoSrc={slide.videoSrc}
                index={i}
                horizontal={isHorizontalFile(slide.videoSrc)}
                onHover={setHovered}
              />
            </CarouselItem>
          ))}
        </CarouselContent>

        {!single && (
          <div className="flex items-center justify-between mt-6 px-1">
            <div className="flex gap-3">
              <CarouselPrevious />
              <CarouselNext />
            </div>
            <span className="font-body text-[10px] tracking-widest text-paper/30 uppercase">
              {slides.length} vídeos
            </span>
          </div>
        )}
      </Carousel>
    </>
  )
}
