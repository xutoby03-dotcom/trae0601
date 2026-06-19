import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Sessions from '@/pages/Sessions';
import Inventory from '@/pages/Inventory';
import Register from '@/pages/Register';
import Checkin from '@/pages/CheckIn';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/register" element={<Register />} />
          <Route path="/checkin" element={<Checkin />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}
