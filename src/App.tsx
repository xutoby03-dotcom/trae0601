import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import Register from '@/pages/Register'
import Borrow from '@/pages/Borrow'
import Return from '@/pages/Return'
import Stats from '@/pages/Stats'
import UmbrellaDetail from '@/pages/UmbrellaDetail'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/borrow/:id" element={<Borrow />} />
          <Route path="/return/:id" element={<Return />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/umbrella/:id" element={<UmbrellaDetail />} />
        </Route>
      </Routes>
    </Router>
  )
}
