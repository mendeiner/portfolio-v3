import { useEffect, useState } from 'react'
import AsterMark from './AsterMark'

export default function LoadingScreen({ onDone }) {
  const [barWidth, setBarWidth] = useState(0)
  const [fading,  setFading]   = useState(false)

  useEffect(() => {
    // Trigger progress bar on next frame so the CSS transition fires
    const raf = requestAnimationFrame(() => setBarWidth(100))

    // After progress (1.8s) + small buffer, start fade-out
    const t1 = setTimeout(() => setFading(true),  1900)
    // After fade-out (0.4s), signal done
    const t2 = setTimeout(() => onDone(),          2300)

    return () => { cancelAnimationFrame(raf); clearTimeout(t1); clearTimeout(t2) }
  }, [onDone])

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        backgroundColor: '#01224D',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.4s ease',
        pointerEvents: fading ? 'none' : 'auto',
      }}
    >
      <div style={{ animation: 'spin 2s linear infinite' }}>
        <AsterMark size={88} color="#FE214D" />
      </div>

      {/* Progress line */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0,
        height: 2,
        width: `${barWidth}%`,
        backgroundColor: '#FE214D',
        transition: 'width 1.8s ease-out',
      }} />
    </div>
  )
}
