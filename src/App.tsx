import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import PlanPage from '@/pages/PlanPage'
import RecordPage from '@/pages/RecordPage'
import AlertPage from '@/pages/AlertPage'
import HandoverPage from '@/pages/HandoverPage'

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<PlanPage />} />
          <Route path="/record" element={<RecordPage />} />
          <Route path="/alert" element={<AlertPage />} />
          <Route path="/handover" element={<HandoverPage />} />
        </Routes>
      </Layout>
    </Router>
  )
}
