import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Dashboard from '@/pages/Dashboard'
import Appointment from '@/pages/Appointment'
import CheckIn from '@/pages/CheckIn'
import Items from '@/pages/Items'
import Alerts from '@/pages/Alerts'
import Stats from '@/pages/Stats'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/appointment" element={<Appointment />} />
          <Route path="/checkin" element={<CheckIn />} />
          <Route path="/items" element={<Items />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/stats" element={<Stats />} />
        </Route>
      </Routes>
    </Router>
  )
}
