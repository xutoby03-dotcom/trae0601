import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import RequestsPage from '@/pages/RequestsPage';
import InventoryPage from '@/pages/InventoryPage';
import RecordsPage from '@/pages/RecordsPage';
import ShortagePage from '@/pages/ShortagePage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<RequestsPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/records" element={<RecordsPage />} />
          <Route path="/shortage" element={<ShortagePage />} />
        </Route>
      </Routes>
    </Router>
  );
}
