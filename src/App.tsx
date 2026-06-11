import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import Vehicles from '@/pages/Vehicles'
import Checkup from '@/pages/Checkup'
import CheckupHistory from '@/pages/CheckupHistory'
import Events from '@/pages/Events'
import Stats from '@/pages/Stats'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/checkup/new" element={<Checkup />} />
          <Route path="/checkup/:vehicleId" element={<Checkup />} />
          <Route path="/checkup/:vehicleId/history" element={<CheckupHistory />} />
          <Route path="/events" element={<Events />} />
          <Route path="/stats" element={<Stats />} />
        </Route>
      </Routes>
    </Router>
  )
}
