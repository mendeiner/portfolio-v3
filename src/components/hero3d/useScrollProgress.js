import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useScrollProgress(triggerSelector = '#hero-section') {
  const progress = useRef(0)

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: triggerSelector,
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self) => {
        progress.current = self.progress
      },
    })
    return () => st.kill()
  }, [triggerSelector])

  return progress
}
