import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import RouteDetail from '@/pages/RouteDetail'
import Reserve from '@/pages/Reserve'
import Admin from '@/pages/Admin'
import RouteForm from '@/pages/RouteForm'
import Stats from '@/pages/Stats'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/stats" element={<Stats />} />
        </Route>
        <Route path="/route/:id" element={<RouteDetail />} />
        <Route path="/route/:id/reserve" element={<Reserve />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/add-route" element={<RouteForm />} />
        <Route path="/admin/edit-route/:routeId" element={<RouteForm />} />
      </Routes>
    </Router>
  )
}
