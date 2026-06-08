import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import Home from '@/pages/Home'
import Register from '@/pages/Register'
import ToolDetail from '@/pages/ToolDetail'
import Borrowings from '@/pages/Borrowings'
import Stats from '@/pages/Stats'

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-wood-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/tool/:id" element={<ToolDetail />} />
          <Route path="/borrowings" element={<Borrowings />} />
          <Route path="/stats" element={<Stats />} />
        </Routes>
      </div>
    </Router>
  )
}
