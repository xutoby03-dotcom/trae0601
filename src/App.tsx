import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { DeviceList } from '@/pages/Devices/DeviceList';
import { DeviceDetail } from '@/pages/Devices/DeviceDetail';
import { DeviceForm } from '@/pages/Devices/DeviceForm';
import { InspectionList } from '@/pages/Inspections/InspectionList';
import { NewInspection } from '@/pages/Inspections/NewInspection';
import { RectificationList } from '@/pages/Rectifications/RectificationList';
import { RectificationDetail } from '@/pages/Rectifications/RectificationDetail';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/devices" element={<DeviceList />} />
          <Route path="/devices/new" element={<DeviceForm />} />
          <Route path="/devices/:id" element={<DeviceDetail />} />
          <Route path="/devices/:id/edit" element={<DeviceForm />} />
          <Route path="/inspections" element={<InspectionList />} />
          <Route path="/inspections/new" element={<NewInspection />} />
          <Route path="/rectifications" element={<RectificationList />} />
          <Route path="/rectifications/:id" element={<RectificationDetail />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
