import * as React from 'react'
import useEmblaCarousel from 'embla-carousel-react'

const CarouselContext = React.createContext(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)
  if (!context) throw new Error('useCarousel must be used within <Carousel />')
  return context
}

export function Carousel({ orientation = 'horizontal', opts, plugins, setApi, className = '', children, ...props }) {
  const [carouselRef, api] = useEmblaCarousel(
    { ...opts, axis: orientation === 'horizontal' ? 'x' : 'y' },
    plugins
  )
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  const onSelect = React.useCallback((api) => {
    if (!api) return
    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
  }, [])

  const scrollPrev = React.useCallback(() => api?.scrollPrev(), [api])
  const scrollNext = React.useCallback(() => api?.scrollNext(), [api])

  const handleKeyDown = React.useCallback((e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); scrollPrev() }
    else if (e.key === 'ArrowRight') { e.preventDefault(); scrollNext() }
  }, [scrollPrev, scrollNext])

  React.useEffect(() => { if (api && setApi) setApi(api) }, [api, setApi])

  React.useEffect(() => {
    if (!api) return
    onSelect(api)
    api.on('reInit', onSelect)
    api.on('select', onSelect)
    return () => api.off('select', onSelect)
  }, [api, onSelect])

  return (
    <CarouselContext.Provider value={{ carouselRef, api, orientation, scrollPrev, scrollNext, canScrollPrev, canScrollNext }}>
      <div
        onKeyDownCapture={handleKeyDown}
        className={`relative ${className}`}
        role="region"
        aria-roledescription="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

export function CarouselContent({ className = '', ...props }) {
  const { carouselRef, orientation } = useCarousel()
  return (
    <div ref={carouselRef} className="overflow-hidden">
      <div
        className={`flex ${orientation === 'horizontal' ? '-ml-2' : '-mt-2 flex-col'} ${className}`}
        {...props}
      />
    </div>
  )
}

export function CarouselItem({ className = 'basis-full', ...props }) {
  const { orientation } = useCarousel()
  return (
    <div
      role="group"
      aria-roledescription="slide"
      className={`min-w-0 shrink-0 grow-0 ${orientation === 'horizontal' ? 'pl-4' : 'pt-4'} ${className}`}
      {...props}
    />
  )
}

export function CarouselPrevious({ className = '', ...props }) {
  const { scrollPrev, canScrollPrev } = useCarousel()
  return (
    <button
      onClick={scrollPrev}
      disabled={!canScrollPrev}
      aria-label="Anterior"
      className={`w-11 h-11 flex items-center justify-center border text-xl transition-colors duration-200
        ${canScrollPrev
          ? 'border-paper/25 text-paper/60 hover:border-signal hover:text-signal cursor-pointer'
          : 'border-paper/10 text-paper/20 cursor-not-allowed'
        } ${className}`}
      {...props}
    >
      ←
    </button>
  )
}

export function CarouselNext({ className = '', ...props }) {
  const { scrollNext, canScrollNext } = useCarousel()
  return (
    <button
      onClick={scrollNext}
      disabled={!canScrollNext}
      aria-label="Próximo"
      className={`w-11 h-11 flex items-center justify-center border text-xl transition-colors duration-200
        ${canScrollNext
          ? 'border-paper/25 text-paper/60 hover:border-signal hover:text-signal cursor-pointer'
          : 'border-paper/10 text-paper/20 cursor-not-allowed'
        } ${className}`}
      {...props}
    >
      →
    </button>
  )
}
