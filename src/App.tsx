import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Members from '@/pages/Members';
import Equipment from '@/pages/Equipment';
import Allocation from '@/pages/Allocation';
import Packing from '@/pages/Packing';
import Return from '@/pages/Return';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/members" element={<Members />} />
          <Route path="/equipment" element={<Equipment />} />
          <Route path="/allocation" element={<Allocation />} />
          <Route path="/packing" element={<Packing />} />
          <Route path="/return" element={<Return />} />
        </Route>
      </Routes>
    </Router>
  );
}
