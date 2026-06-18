import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { FlavorProfile } from './pages/FlavorProfile';
import { ConsumeRegister } from './pages/ConsumeRegister';
import { SuppliesManage } from './pages/SuppliesManage';
import { Statistics } from './pages/Statistics';
import { PurchaseList } from './pages/PurchaseList';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="flavors" element={<FlavorProfile />} />
          <Route path="consume" element={<ConsumeRegister />} />
          <Route path="supplies" element={<SuppliesManage />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="purchase" element={<PurchaseList />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}
