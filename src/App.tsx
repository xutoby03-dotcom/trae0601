import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import SealsList from '@/pages/Seals';
import SealDetail from '@/pages/Seals/Detail';
import SealForm from '@/pages/Seals/Form';
import ApplicationsList from '@/pages/Applications';
import NewApplication from '@/pages/Applications/New';
import ApplicationDetail from '@/pages/Applications/Detail';
import Checkout from '@/pages/Checkout';
import Return from '@/pages/Return';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="seals" element={<SealsList />} />
          <Route path="seals/new" element={<SealForm />} />
          <Route path="seals/:id" element={<SealDetail />} />
          <Route path="seals/:id/edit" element={<SealForm />} />
          <Route path="applications" element={<ApplicationsList />} />
          <Route path="applications/new" element={<NewApplication />} />
          <Route path="applications/:id" element={<ApplicationDetail />} />
          <Route path="checkout/:applicationId" element={<Checkout />} />
          <Route path="return/:recordId" element={<Return />} />
        </Route>
      </Routes>
    </Router>
  );
}
