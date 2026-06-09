import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import Members from '@/pages/Members'
import Recipes from '@/pages/Recipes'
import Inventory from '@/pages/Inventory'
import Records from '@/pages/Records'
import Stats from '@/pages/Stats'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/members" element={<Members />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/records" element={<Records />} />
          <Route path="/stats" element={<Stats />} />
        </Route>
      </Routes>
    </Router>
  )
}
