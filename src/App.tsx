import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import PlantWall from '@/pages/PlantWall'
import RegisterPlant from '@/pages/RegisterPlant'
import PlantDetail from '@/pages/PlantDetail'
import MyPlants from '@/pages/MyPlants'
import Stats from '@/pages/Stats'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<PlantWall />} />
          <Route path="/register" element={<RegisterPlant />} />
          <Route path="/plant/:id" element={<PlantDetail />} />
          <Route path="/my-plants" element={<MyPlants />} />
          <Route path="/stats" element={<Stats />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
