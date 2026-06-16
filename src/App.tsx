import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import Receiving from '@/pages/Receiving'
import Stations from '@/pages/Stations'
import Complaints from '@/pages/Complaints'
import Inventory from '@/pages/Inventory'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/receiving" replace />} />
          <Route path="/receiving" element={<Receiving />} />
          <Route path="/stations" element={<Stations />} />
          <Route path="/complaints" element={<Complaints />} />
          <Route path="/inventory" element={<Inventory />} />
        </Route>
      </Routes>
    </Router>
  )
}
