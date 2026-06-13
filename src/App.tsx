import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import CoatsPage from '@/pages/CoatsPage'
import WashPage from '@/pages/WashPage'
import ReturnPage from '@/pages/ReturnPage'
import RepairPage from '@/pages/RepairPage'
import StatsPage from '@/pages/StatsPage'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/coats" replace />} />
          <Route path="coats" element={<CoatsPage />} />
          <Route path="wash" element={<WashPage />} />
          <Route path="return" element={<ReturnPage />} />
          <Route path="repair" element={<RepairPage />} />
          <Route path="stats" element={<StatsPage />} />
        </Route>
      </Routes>
    </Router>
  )
}
