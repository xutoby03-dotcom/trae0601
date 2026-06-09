import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import Relatives from '@/pages/Relatives'
import Gifts from '@/pages/Gifts'
import Visits from '@/pages/Visits'
import Stats from '@/pages/Stats'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/relatives" element={<Relatives />} />
          <Route path="/gifts" element={<Gifts />} />
          <Route path="/visits" element={<Visits />} />
          <Route path="/stats" element={<Stats />} />
        </Route>
      </Routes>
    </Router>
  )
}
