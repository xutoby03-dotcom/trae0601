import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import Dashboard from '@/pages/Dashboard';
import Subscriptions from '@/pages/Subscriptions';
import Statistics from '@/pages/Statistics';
import SubscriptionFormModal from '@/components/SubscriptionFormModal';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/stats" element={<Statistics />} />
        </Route>
        <Route path="*" element={<Dashboard />} />
      </Routes>
      <SubscriptionFormModal />
    </Router>
  );
}
