import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import TrainingConfigPage from "@/pages/TrainingConfig"
import SegmentRecordPage from "@/pages/SegmentRecord"
import SyncAnalysisPage from "@/pages/SyncAnalysis"

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TrainingConfigPage />} />
        <Route path="/record" element={<SegmentRecordPage />} />
        <Route path="/analysis" element={<SyncAnalysisPage />} />
      </Routes>
    </Router>
  )
}
