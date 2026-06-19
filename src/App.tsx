import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from '@/components/Layout';
import DashboardPage from '@/pages/DashboardPage';
import DeviceListPage from '@/pages/DeviceListPage';
import DeviceFormPage from '@/pages/DeviceFormPage';
import DeviceDetailPage from '@/pages/DeviceDetailPage';
import UsageListPage from '@/pages/UsageListPage';
import UsageFormPage from '@/pages/UsageFormPage';
import UsageDetailPage from '@/pages/UsageDetailPage';
import DisinfectionQueuePage from '@/pages/DisinfectionQueuePage';
import DisinfectionProcessPage from '@/pages/DisinfectionProcessPage';
import DisinfectionRecordsPage from '@/pages/DisinfectionRecordsPage';
import InventoryPage from '@/pages/InventoryPage';
import ScrapRecordPage from '@/pages/ScrapRecordPage';
import { useAppStore } from '@/store';

function Initializer() {
  const refreshAll = useAppStore(s => s.refreshAll);
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);
  return null;
}

export default function App() {
  return (
    <Router>
      <Initializer />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="devices" element={<DeviceListPage />} />
          <Route path="devices/new" element={<DeviceFormPage />} />
          <Route path="devices/:id" element={<DeviceDetailPage />} />
          <Route path="devices/:id/edit" element={<DeviceFormPage />} />
          <Route path="usage" element={<UsageListPage />} />
          <Route path="usage/new" element={<UsageFormPage />} />
          <Route path="usage/:id" element={<UsageDetailPage />} />
          <Route path="disinfection" element={<DisinfectionQueuePage />} />
          <Route path="disinfection/records" element={<DisinfectionRecordsPage />} />
          <Route path="disinfection/:id" element={<DisinfectionProcessPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="inventory/scrap" element={<ScrapRecordPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
