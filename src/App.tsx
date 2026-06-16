import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Dashboard from '@/pages/Dashboard'
import Games from '@/pages/Games'
import GameDetail from '@/pages/GameDetail'
import CheckIn from '@/pages/CheckIn'
import CheckOut from '@/pages/CheckOut'
import Lending from '@/pages/Lending'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/games" element={<Games />} />
          <Route path="/games/:id" element={<GameDetail />} />
          <Route path="/games/:id/checkin" element={<CheckIn />} />
          <Route path="/games/:id/checkout" element={<CheckOut />} />
          <Route path="/lending" element={<Lending />} />
        </Route>
      </Routes>
    </Router>
  )
}
