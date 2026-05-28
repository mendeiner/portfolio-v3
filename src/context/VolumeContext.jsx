import { createContext, useContext, useState } from 'react'

const VolumeContext = createContext(null)

const STORAGE_KEY = 'obrunoedita-volume'

function loadVolume() {
  try {
    const v = parseFloat(localStorage.getItem(STORAGE_KEY))
    if (!isNaN(v) && v >= 0.02 && v <= 1) return v
  } catch {}
  return 0.8
}

export function VolumeProvider({ children }) {
  const [volume, setVolumeState] = useState(loadVolume)
  const [isMuted, setIsMuted] = useState(true)

  const setVolume = (v) => {
    setVolumeState(v)
    try { localStorage.setItem(STORAGE_KEY, String(v)) } catch {}
  }

  return (
    <VolumeContext.Provider value={{ volume, setVolume, isMuted, setIsMuted }}>
      {children}
    </VolumeContext.Provider>
  )
}

export function useVolume() {
  return useContext(VolumeContext)
}
