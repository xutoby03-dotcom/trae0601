import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import MembersPage from '@/pages/MembersPage';
import EquipmentPage from '@/pages/EquipmentPage';
import AssignmentPage from '@/pages/AssignmentPage';
import PackingPage from '@/pages/PackingPage';
import ReturnPage from '@/pages/ReturnPage';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<MembersPage />} />
          <Route path="/equipment" element={<EquipmentPage />} />
          <Route path="/assignment" element={<AssignmentPage />} />
          <Route path="/packing" element={<PackingPage />} />
          <Route path="/return" element={<ReturnPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}
