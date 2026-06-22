import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ObservationPage from '@/pages/ObservationPage'
import CellManagementPage from '@/pages/CellManagementPage'
import DailyRecordPage from '@/pages/DailyRecordPage'
import AnalysisPage from '@/pages/AnalysisPage'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ObservationPage />} />
        <Route path="/cells" element={<CellManagementPage />} />
        <Route path="/record" element={<DailyRecordPage />} />
        <Route path="/analysis" element={<AnalysisPage />} />
      </Routes>
    </Router>
  )
}
