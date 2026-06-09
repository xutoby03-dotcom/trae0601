import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from '@/pages/Home'
import RecordForm from '@/pages/RecordForm'
import RecordDetail from '@/pages/RecordDetail'
import FailureAnalysis from '@/pages/FailureAnalysis'
import VersionManager from '@/pages/VersionManager'
import VersionCompare from '@/pages/VersionCompare'
import Stats from '@/pages/Stats'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/record/new" element={<RecordForm />} />
        <Route path="/record/:id" element={<RecordDetail />} />
        <Route path="/record/:id/edit" element={<RecordForm />} />
        <Route path="/record/:id/analysis" element={<FailureAnalysis />} />
        <Route path="/version/:productId" element={<VersionManager />} />
        <Route path="/compare/:productId" element={<VersionCompare />} />
        <Route path="/stats" element={<Stats />} />
      </Routes>
    </Router>
  )
}
