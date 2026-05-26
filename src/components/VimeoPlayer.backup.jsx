export default function VimeoPlayer({ vimeoId, title = '', vertical = true }) {
  const isPlaceholder = vimeoId === 'PLACEHOLDER'

  if (isPlaceholder) {
    return (
      <div className={`relative bg-navy/60 border border-crimson/30 flex items-center justify-center ${vertical ? 'h-[60vh] w-auto aspect-reel mx-auto' : 'w-full aspect-video'}`}>
        <p className="font-body text-paper/40 text-sm tracking-widest uppercase text-center px-6">
          vídeo em breve
        </p>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${vertical ? 'h-[60vh] w-auto aspect-reel mx-auto' : 'w-full aspect-video'}`}>
      <iframe
        src={`https://player.vimeo.com/video/${vimeoId}?autoplay=0&title=0&byline=0&portrait=0&color=FE214D`}
        className="absolute inset-0 w-full h-full"
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title={title}
      />
    </div>
  )
}
