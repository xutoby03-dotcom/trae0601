import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import MedicineDetail from '@/pages/MedicineDetail'
import AddMedicine from '@/pages/AddMedicine'
import RestockList from '@/pages/RestockList'
import ExportPage from '@/pages/ExportPage'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/medicine/:id" element={<MedicineDetail />} />
          <Route path="/add" element={<AddMedicine />} />
          <Route path="/edit/:id" element={<AddMedicine />} />
          <Route path="/restock" element={<RestockList />} />
          <Route path="/export" element={<ExportPage />} />
        </Route>
      </Routes>
    </Router>
  )
}
