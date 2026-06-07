import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Home from '@/pages/Home'
import CreateCapsule from '@/pages/CreateCapsule'
import CapsuleDetailPage from '@/pages/CapsuleDetail'
import Timeline from '@/pages/Timeline'
import Backup from '@/pages/Backup'
import Navbar from '@/components/Navbar'
import Toast from '@/components/Toast'
import { useCapsuleStore } from '@/store/capsuleStore'

export default function App() {
  const loadCapsules = useCapsuleStore((s) => s.loadCapsules)

  useEffect(() => {
    loadCapsules()
  }, [loadCapsules])

  return (
    <Router>
      <div className="min-h-screen" style={{ background: '#2C1810' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateCapsule />} />
          <Route path="/create/:templateId" element={<CreateCapsule />} />
          <Route path="/capsule/:id" element={<CapsuleDetailPage />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/backup" element={<Backup />} />
        </Routes>
        <Navbar />
        <Toast />
      </div>
    </Router>
  )
}
