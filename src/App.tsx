import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import Elders from '@/pages/Elders'
import ElderDetail from '@/pages/ElderDetail'
import Chronic from '@/pages/Chronic'
import FollowUp from '@/pages/FollowUp'
import Tasks from '@/pages/Tasks'
import Stats from '@/pages/Stats'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/elders" element={<Elders />} />
          <Route path="/elders/new" element={<ElderDetail />} />
          <Route path="/elders/:id" element={<ElderDetail />} />
          <Route path="/chronic" element={<Chronic />} />
          <Route path="/chronic/:elderId" element={<Chronic />} />
          <Route path="/followup" element={<FollowUp />} />
          <Route path="/followup/:elderId" element={<FollowUp />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/stats" element={<Stats />} />
        </Route>
      </Routes>
    </Router>
  )
}
