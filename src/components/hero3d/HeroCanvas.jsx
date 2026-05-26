import { useState, useEffect, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { PhoneModel } from './PhoneModel'
import { MobileHero } from './MobileHero'
import { useScrollProgress } from './useScrollProgress'

function DesktopCanvas({ isMuted, volume }) {
  const scrollProgress = useScrollProgress('#hero-section')

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        {/* Explicit navy background prevents white flash when React re-renders */}
        <color attach="background" args={['#01224D']} />

        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 6, 3]} intensity={1.4} />
        <directionalLight position={[-3, -2, 1]} intensity={0.4} color="#FE214D" />

        <Environment preset="city" />

        <Suspense fallback={null}>
          <PhoneModel scrollProgress={scrollProgress} isMuted={isMuted} volume={volume} />
        </Suspense>
      </Canvas>
    </div>
  )
}

// Synchronously check viewport on first render so mobile devices never
// momentarily mount the WebGL Canvas (which would start loading Three.js +
// the GLB before being torn down on the next render).
const detectMobile = () => typeof window !== 'undefined' && window.innerWidth < 768

export function HeroCanvas({ isMuted, volume }) {
  // 2D hand used on both mobile and desktop. The 3D path (DesktopCanvas +
  // PhoneModel) is preserved above as a backup — to restore it, branch on
  // `detectMobile()` like before.
  return <MobileHero isMuted={isMuted} volume={volume} />
}
