import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import BatchList from '@/pages/BatchList';
import BatchNew from '@/pages/BatchNew';
import BatchDetail from '@/pages/BatchDetail';
import Feedback from '@/pages/Feedback';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="batches" element={<BatchList />} />
          <Route path="batches/new" element={<BatchNew />} />
          <Route path="batches/:id" element={<BatchDetail />} />
          <Route path="feedback" element={<Feedback />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}
