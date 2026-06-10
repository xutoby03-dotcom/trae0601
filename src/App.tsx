import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import Alerts from '@/components/Alerts'
import { useApp } from '@/store/app'
import FloorPlanPage from '@/pages/FloorPlanPage'
import ExhibitionsPage from '@/pages/ExhibitionsPage'
import ExhibitionDetailPage from '@/pages/ExhibitionDetailPage'
import ApplicationsPage from '@/pages/ApplicationsPage'
import ApplyPage from '@/pages/ApplyPage'
import MyApplicationsPage from '@/pages/MyApplicationsPage'
import SetupPage from '@/pages/SetupPage'
import StatsPage from '@/pages/StatsPage'

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex w-full bg-[#f7f5f0] relative overflow-hidden">
      <Sidebar />
      <main className="flex-1 min-w-0 flex flex-col relative">
        <div className="absolute inset-0 grain-overlay" />
        <div className="relative z-10 flex-1 flex flex-col min-h-0">
          {children}
        </div>
      </main>
      <Alerts />
    </div>
  )
}

export default function App() {
  const { fetchExhibitions, currentExhibitionId } = useApp()

  useEffect(() => {
    fetchExhibitions()
  }, [])

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<FloorPlanPage />} />
          <Route path="/exhibitions" element={<ExhibitionsPage />} />
          <Route path="/exhibitions/create" element={<ExhibitionDetailPage create />} />
          <Route path="/exhibitions/:id" element={<ExhibitionDetailPage />} />
          <Route path="/exhibitions/:id/applications" element={<ApplicationsPage />} />
          <Route path="/apply" element={<ApplyPage />} />
          <Route path="/apply/my" element={<MyApplicationsPage />} />
          <Route path="/setup/:id" element={<SetupPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  )
}
