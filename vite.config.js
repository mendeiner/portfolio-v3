import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readdirSync, existsSync } from 'fs'
import { resolve } from 'path'

function videoManifestPlugin() {
  const VIRTUAL_ID = 'virtual:video-manifest'
  const RESOLVED_ID = '\0virtual:video-manifest'
  let base = '/'

  function buildManifest() {
    const videosDir = resolve('./public/videos')
    const manifest = {}
    if (!existsSync(videosDir)) return manifest
    for (const entry of readdirSync(videosDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const dir = resolve(videosDir, entry.name)
      const files = readdirSync(dir)
        .filter(f => /\.(webm|mp4|mov)$/i.test(f))
        .sort((a, b) => {
          const aLast = /1080/i.test(a)
          const bLast = /1080/i.test(b)
          if (aLast !== bLast) return aLast ? 1 : -1
          return a.localeCompare(b)
        })
      if (files.length) {
        manifest[entry.name] = files.map(f => `${base}videos/${entry.name}/${f}`)
      }
    }
    return manifest
  }

  return {
    name: 'video-manifest',
    configResolved(resolvedConfig) {
      base = resolvedConfig.base
    },
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
    },
    load(id) {
      if (id === RESOLVED_ID) {
        return `export default ${JSON.stringify(buildManifest())}`
      }
    },
    configureServer(server) {
      const videosDir = resolve('./public/videos')
      server.watcher.add(videosDir)
      server.watcher.on('all', (_, filePath) => {
        if (!filePath.startsWith(videosDir)) return
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID)
        if (mod) server.moduleGraph.invalidateModule(mod)
        server.ws.send({ type: 'full-reload' })
      })
    },
  }
}

const base = process.env.GITHUB_PAGES === 'true' ? '/portfolio-v3/' : '/'

export default defineConfig({
  base,
  plugins: [react(), videoManifestPlugin()],
  optimizeDeps: {
    include: ['three'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/three/')) return 'three-vendor'
          if (id.includes('@react-three/fiber') || id.includes('@react-three/drei')) return 'r3f-vendor'
          if (id.includes('/node_modules/gsap/')) return 'gsap-vendor'
        },
      },
    },
  },
})
