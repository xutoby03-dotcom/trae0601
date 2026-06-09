import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from '@/pages/Home'
import Record from '@/pages/Record'
import Rules from '@/pages/Rules'
import Stats from '@/pages/Stats'
import BottomNav from '@/components/BottomNav'

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-stone-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/record" element={<Record />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/stats" element={<Stats />} />
        </Routes>
        <BottomNav />
      </div>
    </Router>
  )
}
