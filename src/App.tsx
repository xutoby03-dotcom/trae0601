import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { DeviceList } from '@/pages/DeviceList';
import { DeviceForm } from '@/pages/DeviceForm';
import { Lending } from '@/pages/Lending';
import { Return } from '@/pages/Return';
import { Compensation } from '@/pages/Compensation';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/devices" element={<DeviceList />} />
          <Route path="/devices/:id/edit" element={<DeviceForm />} />
          <Route path="/devices/new" element={<DeviceForm />} />
          <Route path="/lending" element={<Lending />} />
          <Route path="/return" element={<Return />} />
          <Route path="/compensation" element={<Compensation />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}
