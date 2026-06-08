import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from '@/pages/Home'
import Stats from '@/pages/Stats'
import ExportPage from '@/pages/Export'
import Navigation from '@/components/Navigation'

export default function App() {
  return (
    <Router>
      <div className="font-body">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/export" element={<ExportPage />} />
        </Routes>
        <Navigation />
      </div>
    </Router>
  )
}
