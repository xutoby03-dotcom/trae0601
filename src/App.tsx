import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import AddPet from '@/pages/AddPet'
import EditPet from '@/pages/EditPet'
import PetDetail from '@/pages/PetDetail'
import AddRecord from '@/pages/AddRecord'
import Stats from '@/pages/Stats'
import Search from '@/pages/Search'
import ExportPage from '@/pages/ExportPage'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/add-pet" element={<AddPet />} />
          <Route path="/pet/:id" element={<PetDetail />} />
          <Route path="/pet/:id/edit" element={<EditPet />} />
          <Route path="/pet/:id/add-record" element={<AddRecord />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/search" element={<Search />} />
          <Route path="/export/:id" element={<ExportPage />} />
        </Route>
      </Routes>
    </Router>
  )
}
