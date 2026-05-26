import ProjectCard from '../components/ProjectCard'
import { projects } from '../data/projects'
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '../components/ui/carousel'

const SECTIONS = [
  { key: 'brand',      title: 'Brand Film' },
  { key: 'founder',    title: 'Founder' },
  { key: 'lancamento', title: 'Lançamento' },
  { key: 'cobertura',  title: 'Cobertura' },
]

export default function Work() {
  return (
    <div className="min-h-screen bg-navy">
      <div className="px-6 md:px-10 pt-12 pb-6 border-b border-paper/10">
        <div className="flex items-baseline justify-between">
          <h1 className="font-editorial text-paper/90 text-3xl md:text-4xl italic">
            todo o trabalho
          </h1>
          <span className="font-body text-[10px] tracking-widest uppercase text-paper/40">
            {projects.length} obras · 2023–25
          </span>
        </div>
      </div>

      <div className="px-6 md:px-10 py-10 space-y-14">
        {SECTIONS.map(({ key, title }) => {
          const items = projects.filter((p) => p.category === key)
          if (!items.length) return null
          return (
            <section key={key} className="border-b border-paper/10 pb-10 last:border-0 last:pb-0">
              <div className="flex items-baseline justify-between mb-5">
                <h2 className="font-editorial text-signal italic text-2xl md:text-3xl">
                  {title}<span className="text-signal">.</span>
                </h2>
                <span className="font-body text-[10px] tracking-widest uppercase text-paper/40">
                  {items.length} {items.length === 1 ? 'obra' : 'obras'}
                </span>
              </div>

              <Carousel opts={{ align: 'center', containScroll: false, loop: true }}>
                <CarouselContent>
                  {items.map((project) => (
                    <CarouselItem key={project.slug} className="basis-auto">
                      <ProjectCard project={project} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="absolute inset-y-0 left-0 w-16 md:w-32 lg:w-48 z-10 pointer-events-none bg-gradient-to-r from-navy to-transparent" />
                <div className="absolute inset-y-0 right-0 w-16 md:w-32 lg:w-48 z-10 pointer-events-none bg-gradient-to-l from-navy to-transparent" />
                <CarouselPrevious className="absolute left-3 top-1/2 -translate-y-1/2 z-20" />
                <CarouselNext className="absolute right-3 top-1/2 -translate-y-1/2 z-20" />
              </Carousel>
            </section>
          )
        })}
      </div>
    </div>
  )
}
