import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import Dashboard from '@/pages/Dashboard'
import Checkout from '@/pages/Checkout'
import Return from '@/pages/Return'
import Inventory from '@/pages/Inventory'
import Maintenance from '@/pages/Maintenance'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/return" element={<Return />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/maintenance" element={<Maintenance />} />
        </Route>
      </Routes>
    </Router>
  )
}
