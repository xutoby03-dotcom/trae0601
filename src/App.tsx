import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Board from '@/pages/Board'
import NewOrder from '@/pages/NewOrder'
import OrderDetail from '@/pages/OrderDetail'
import Rooms from '@/pages/Rooms'
import RoomDetail from '@/pages/RoomDetail'
import Stats from '@/pages/Stats'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Board />} />
          <Route path="/order/new" element={<NewOrder />} />
          <Route path="/order/:id" element={<OrderDetail />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/rooms/:roomId" element={<RoomDetail />} />
          <Route path="/stats" element={<Stats />} />
        </Route>
      </Routes>
    </Router>
  )
}
