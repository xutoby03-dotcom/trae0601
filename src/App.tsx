import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Board from '@/pages/Board'
import Rooms from '@/pages/Rooms'
import Report from '@/pages/Report'
import TicketDetail from '@/pages/TicketDetail'
import Alternatives from '@/pages/Alternatives'
import Stats from '@/pages/Stats'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Board />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/report" element={<Report />} />
          <Route path="/ticket/:id" element={<TicketDetail />} />
          <Route path="/alternatives" element={<Alternatives />} />
          <Route path="/stats" element={<Stats />} />
        </Route>
      </Routes>
    </Router>
  )
}
