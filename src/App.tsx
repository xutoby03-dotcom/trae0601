import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import DeviceList from '@/pages/DeviceList';
import DeviceDetail from '@/pages/DeviceDetail';
import BorrowForm from '@/pages/BorrowForm';
import ReturnForm from '@/pages/ReturnForm';
import Records from '@/pages/Records';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/devices" element={<DeviceList />} />
          <Route path="/devices/:id" element={<DeviceDetail />} />
          <Route path="/borrow" element={<BorrowForm />} />
          <Route path="/return" element={<ReturnForm />} />
          <Route path="/records" element={<Records />} />
        </Routes>
      </Layout>
    </Router>
  );
}
