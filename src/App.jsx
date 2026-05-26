import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { createContext, useEffect, useState, lazy, Suspense } from 'react'
import Nav from './components/Nav'
import Home from './pages/Home'
import LoadingScreen from './components/LoadingScreen'

const Work = lazy(() => import('./pages/Work'))
const WorkDetail = lazy(() => import('./pages/WorkDetail'))
const Contact = lazy(() => import('./pages/Contact'))

export const LoadingContext = createContext(false)

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [pathname])
  return null
}

export default function App() {
  const [loaded, setLoaded] = useState(false)

  return (
    <LoadingContext.Provider value={loaded}>
      {!loaded && <LoadingScreen onDone={() => setLoaded(true)} />}
      <ScrollToTop />
      <Nav />
      <main className="pt-16 overflow-x-hidden">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/work" element={<Suspense fallback={null}><Work /></Suspense>} />
          <Route path="/work/:slug" element={<Suspense fallback={null}><WorkDetail /></Suspense>} />
          <Route path="/about" element={<Navigate to="/" replace />} />
          <Route path="/contact" element={<Suspense fallback={null}><Contact /></Suspense>} />
        </Routes>
      </main>
    </LoadingContext.Provider>
  )
}
