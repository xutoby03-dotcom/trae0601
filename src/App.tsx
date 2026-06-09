import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import Devices from '@/pages/Devices'
import DeviceForm from '@/pages/DeviceForm'
import Daily from '@/pages/Daily'
import Reminders from '@/pages/Reminders'
import Maintenance from '@/pages/Maintenance'
import Statistics from '@/pages/Statistics'

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/devices/add" element={<DeviceForm />} />
          <Route path="/devices/:id/edit" element={<DeviceForm />} />
          <Route path="/daily" element={<Daily />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/statistics" element={<Statistics />} />
        </Routes>
      </Layout>
    </Router>
  )
}
