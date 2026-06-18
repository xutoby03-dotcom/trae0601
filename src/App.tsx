import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import TankProfile from '@/pages/TankProfile';
import FilterMaterials from '@/pages/FilterMaterials';
import Maintenance from '@/pages/Maintenance';
import WaterQuality from '@/pages/WaterQuality';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="tank" element={<TankProfile />} />
          <Route path="filter-materials" element={<FilterMaterials />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="water-quality" element={<WaterQuality />} />
        </Route>
      </Routes>
    </Router>
  );
}
