import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import Home from '@/pages/Home'
import PetDetail from '@/pages/PetDetail'
import PetNew from '@/pages/PetNew'
import FosterList from '@/pages/FosterList'
import FosterDetail from '@/pages/FosterDetail'
import FosterNew from '@/pages/FosterNew'
import Checkin from '@/pages/Checkin'
import Messages from '@/pages/Messages'
import Stats from '@/pages/Stats'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/pet/new" element={<PetNew />} />
          <Route path="/pet/:id" element={<PetDetail />} />
          <Route path="/pet/:id/edit" element={<PetNew />} />
          <Route path="/foster" element={<FosterList />} />
          <Route path="/foster/new" element={<FosterNew />} />
          <Route path="/foster/:id" element={<FosterDetail />} />
          <Route path="/foster/:id/checkin" element={<Checkin />} />
          <Route path="/foster/:id/messages" element={<Messages />} />
          <Route path="/foster/:id/stats" element={<Stats />} />
        </Route>
      </Routes>
    </Router>
  )
}
