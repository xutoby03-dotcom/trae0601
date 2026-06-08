import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import AddPlant from '@/pages/AddPlant'
import PlantDetail from '@/pages/PlantDetail'
import Observe from '@/pages/Observe'
import Stats from '@/pages/Stats'

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add" element={<AddPlant />} />
          <Route path="/plant/:id" element={<PlantDetail />} />
          <Route path="/observe/:id" element={<Observe />} />
          <Route path="/stats" element={<Stats />} />
        </Routes>
      </Layout>
    </Router>
  )
}
