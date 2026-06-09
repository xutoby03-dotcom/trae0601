import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import Jobs from '@/pages/Jobs'
import Shifts from '@/pages/Shifts'
import Income from '@/pages/Income'
import Leave from '@/pages/Leave'
import Stats from '@/pages/Stats'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/shifts" element={<Shifts />} />
          <Route path="/income" element={<Income />} />
          <Route path="/leave" element={<Leave />} />
          <Route path="/stats" element={<Stats />} />
        </Route>
      </Routes>
    </Router>
  )
}
