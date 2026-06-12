import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import DeviceList from '@/pages/devices/DeviceList';
import DeviceForm from '@/pages/devices/DeviceForm';
import DeviceDetail from '@/pages/devices/DeviceDetail';
import BorrowList from '@/pages/borrows/BorrowList';
import BorrowForm from '@/pages/borrows/BorrowForm';
import ReturnList from '@/pages/returns/ReturnList';
import ReturnCheck from '@/pages/returns/ReturnCheck';
import RepairList from '@/pages/repairs/RepairList';
import RepairForm from '@/pages/repairs/RepairForm';
import RepairDetail from '@/pages/repairs/RepairDetail';
import { useAppStore } from '@/store';

export default function App() {
  const refreshOverdueStatus = useAppStore((s) => s.refreshOverdueStatus);

  useEffect(() => {
    refreshOverdueStatus();
    const timer = setInterval(refreshOverdueStatus, 60000);
    return () => clearInterval(timer);
  }, [refreshOverdueStatus]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />

          <Route path="devices">
            <Route index element={<DeviceList />} />
            <Route path="new" element={<DeviceForm />} />
            <Route path=":id" element={<DeviceDetail />} />
            <Route path=":id/edit" element={<DeviceForm />} />
          </Route>

          <Route path="borrows">
            <Route index element={<BorrowList />} />
            <Route path="new" element={<BorrowForm />} />
          </Route>

          <Route path="returns">
            <Route index element={<ReturnList />} />
            <Route path=":borrowId" element={<ReturnCheck />} />
          </Route>

          <Route path="repairs">
            <Route index element={<RepairList />} />
            <Route path="new" element={<RepairForm />} />
            <Route path=":id" element={<RepairDetail />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
