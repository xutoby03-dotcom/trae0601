import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import DashboardPage from '@/pages/DashboardPage';
import DeviceListPage from '@/pages/DeviceListPage';
import DeviceFormPage from '@/pages/DeviceFormPage';
import DeviceDetailPage from '@/pages/DeviceDetailPage';
import InspectionFormPage from '@/pages/InspectionFormPage';
import AlertsPage from '@/pages/AlertsPage';
import { useAppStore } from '@/store';

export default function App() {
  useEffect(() => {
    useAppStore.getState().initData();
  }, []);

  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/devices" element={<DeviceListPage />} />
          <Route path="/devices/new" element={<DeviceFormPage />} />
          <Route path="/devices/:id" element={<DeviceDetailPage />} />
          <Route path="/devices/:id/edit" element={<DeviceFormPage />} />
          <Route path="/devices/:id/inspection" element={<InspectionFormPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
