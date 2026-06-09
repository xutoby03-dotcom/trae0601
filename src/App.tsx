import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Materials from '@/pages/Materials';
import AddMaterial from '@/pages/AddMaterial';
import MaterialDetail from '@/pages/MaterialDetail';
import Usage from '@/pages/Usage';
import AddUsage from '@/pages/AddUsage';
import Inspirations from '@/pages/Inspirations';
import AddInspiration from '@/pages/AddInspiration';
import InspirationDetail from '@/pages/InspirationDetail';
import Stats from '@/pages/Stats';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/materials/add" element={<AddMaterial />} />
          <Route path="/materials/:id" element={<MaterialDetail />} />
          <Route path="/usage" element={<Usage />} />
          <Route path="/usage/add" element={<AddUsage />} />
          <Route path="/inspirations" element={<Inspirations />} />
          <Route path="/inspirations/add" element={<AddInspiration />} />
          <Route path="/inspirations/:id" element={<InspirationDetail />} />
          <Route path="/stats" element={<Stats />} />
        </Route>
      </Routes>
    </Router>
  );
}
