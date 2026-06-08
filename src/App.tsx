import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Dashboard from '@/pages/Dashboard'
import AddGear from '@/pages/AddGear'
import EditGear from '@/pages/EditGear'
import GearDetail from '@/pages/GearDetail'
import RecordUsage from '@/pages/RecordUsage'
import Maintenance from '@/pages/Maintenance'
import Stats from '@/pages/Stats'

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add" element={<AddGear />} />
          <Route path="/edit/:id" element={<EditGear />} />
          <Route path="/gear/:id" element={<GearDetail />} />
          <Route path="/record" element={<RecordUsage />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/stats" element={<Stats />} />
        </Routes>
      </Layout>
    </Router>
  )
}
