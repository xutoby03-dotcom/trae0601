import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import BorrowPage from '@/pages/BorrowPage';
import ReturnPage from '@/pages/ReturnPage';
import RepairPage from '@/pages/RepairPage';
import StatsPage from '@/pages/StatsPage';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/borrow" element={<BorrowPage />} />
          <Route path="/return/:id" element={<ReturnPage />} />
          <Route path="/repair" element={<RepairPage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}
