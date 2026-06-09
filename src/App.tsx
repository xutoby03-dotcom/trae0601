import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import PetList from '@/pages/PetList'
import PetForm from '@/pages/PetForm'
import NewAppointment from '@/pages/NewAppointment'
import AppointmentDetail from '@/pages/AppointmentDetail'
import AppointmentList from '@/pages/AppointmentList'
import Stats from '@/pages/Stats'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/pets" element={<PetList />} />
          <Route path="/pets/:id" element={<PetForm />} />
          <Route path="/appointments" element={<AppointmentList />} />
          <Route path="/appointments/new" element={<NewAppointment />} />
          <Route path="/appointments/:id" element={<AppointmentDetail />} />
          <Route path="/stats" element={<Stats />} />
        </Route>
      </Routes>
    </Router>
  )
}
