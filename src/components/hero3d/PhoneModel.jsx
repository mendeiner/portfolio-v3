import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF, useVideoTexture } from '@react-three/drei'
import * as THREE from 'three'

const SCREEN_NODE = 'pCube19_manoparazetatratadaenzeta2aiFlat1_0'
const BEZEL_NODE  = 'manoparazetatratadaenzeta2pCube19_lambert1_0'
// Hand geometry nodes — must render after the screen so they appear in front
const HAND_NODES  = [
  'manoparazetatratadaenzeta2Group56172_aiStandardSurface2_0',
  'manoparazetatratadaenzeta2Group56172_aiStandardSurface2_0_1',
]

const ROT_X = 1.50
const ROT_Y_START = 2.63
const ROT_Y_END = 3.14
const ROT_Z = 1.45
const POS = { x: -2.4, y: -0.5, z: 0.7 }
const ENTRANCE_DURATION = 1.2

export function PhoneModel({ scrollProgress, isMuted, volume }) {
  const group = useRef()
  const innerGroup = useRef()
  const meshesRef = useRef([])
  const originalsRef = useRef([])
  const elapsed = useRef(0)
  const { viewport } = useThree()
  const isMobile = viewport.width < 5

  const MOBILE_POS = { x: -3.4, y: -1.2, z: -0.7 }
  const pos = isMobile ? MOBILE_POS : POS
  const scale = isMobile ? 0.20 : 0.25
  const { scene } = useGLTF('/models/hand-phone.glb')

  const videoTexture = useVideoTexture('/videos/reel.webm', {
    muted: true,
    loop: true,
    start: true,
    playsInline: true,
  })

  useEffect(() => {
    const video = videoTexture?.image
    if (!video) return
    video.muted = isMuted
    video.volume = isMuted ? 0 : (volume ?? 0.8)
    if (!isMuted) video.play().catch(() => {})
  }, [isMuted, volume, videoTexture])

  // Pause video on unmount (navigation away)
  useEffect(() => {
    const video = videoTexture?.image
    return () => { if (video) video.pause() }
  }, [videoTexture])

  useEffect(() => {
    if (!videoTexture) return
    videoTexture.wrapS = THREE.ClampToEdgeWrapping
    videoTexture.wrapT = THREE.ClampToEdgeWrapping
    videoTexture.rotation = 1.56
    videoTexture.center.set(0.5, 0.5)
    videoTexture.repeat.set(4.10, 4.05)
    videoTexture.offset.set(1.53, 1.03)
    videoTexture.needsUpdate = true
  }, [videoTexture])

  useEffect(() => {
    meshesRef.current = []
    originalsRef.current = []
    const newMats = []

    scene.traverse((child) => {
      if (!child.isMesh) return
      originalsRef.current.push({ child, mat: child.material })

      if (child.name === BEZEL_NODE) {
        child.visible = false
        return
      }

      if (child.name === SCREEN_NODE) {
        const mat = new THREE.MeshBasicMaterial({
          map: videoTexture,
          toneMapped: false,
          transparent: true,
          depthTest: false,
          depthWrite: false,
          side: THREE.DoubleSide,
        })
        child.material = mat
        child.renderOrder = 1
        newMats.push(mat)
      } else if (HAND_NODES.includes(child.name)) {
        const mat = new THREE.MeshStandardMaterial().copy(child.material)
        mat.transparent = true
        child.material = mat
        // Render after the screen (renderOrder 1) so hand appears in front
        child.renderOrder = 2
        newMats.push(mat)
      } else {
        const mat = new THREE.MeshStandardMaterial().copy(child.material)
        mat.transparent = true
        child.material = mat
        newMats.push(mat)
      }

      meshesRef.current.push(child)
    })

    return () => {
      originalsRef.current.forEach(({ child, mat }) => { child.material = mat })
      newMats.forEach((m) => m.dispose())
      meshesRef.current = []
    }
  }, [scene, videoTexture])

  const isMutedRef = useRef(isMuted)
  useEffect(() => { isMutedRef.current = isMuted }, [isMuted])
  const volumeRef = useRef(volume)
  useEffect(() => { volumeRef.current = volume }, [volume])

  useFrame((_, delta) => {
    if (!group.current || !innerGroup.current) return

    videoTexture.needsUpdate = true

    elapsed.current = Math.min(elapsed.current + delta, ENTRANCE_DURATION)
    const t = elapsed.current / ENTRANCE_DURATION
    const eased = t < 1 ? 1 - Math.pow(1 - t, 3) : 1
    innerGroup.current.rotation.y = ROT_Y_START + (ROT_Y_END - ROT_Y_START) * eased

    const p = scrollProgress.current
    const anim = Math.max(0, (p - 0.3) / 0.7)
    group.current.position.y = pos.y - anim * 1.5
    const opacity = Math.max(0, 1 - anim)
    meshesRef.current.forEach((mesh) => { mesh.material.opacity = opacity })

    // Fade volume with scroll (mirrors model opacity), navigation-away is handled by unmount cleanup
    const video = videoTexture?.image
    if (video && !isMutedRef.current) {
      video.volume = (volumeRef.current ?? 0.8) * opacity
    }
  })

  return (
    <group ref={group} position={[pos.x, pos.y, pos.z]}>
      <group ref={innerGroup} rotation={[ROT_X, ROT_Y_START, ROT_Z]} scale={scale}>
        <primitive object={scene} dispose={null} />
      </group>
    </group>
  )
}

useGLTF.preload('/models/hand-phone.glb')
