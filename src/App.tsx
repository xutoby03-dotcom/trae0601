import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { Bags } from '@/pages/Bags';
import { Borrow } from '@/pages/Borrow';
import { Return } from '@/pages/Return';
import { Overdue } from '@/pages/Overdue';
import { Statistics } from '@/pages/Statistics';
import { useAppStore } from '@/store/useAppStore';

const OVERDUE_REFRESH_INTERVAL = 60 * 1000;

export default function App() {
  const initData = useAppStore(state => state.initData);
  const refreshOverdueStatus = useAppStore(state => state.refreshOverdueStatus);
  
  useEffect(() => {
    initData();
  }, [initData]);
  
  useEffect(() => {
    refreshOverdueStatus();
    const timer = setInterval(() => {
      refreshOverdueStatus();
    }, OVERDUE_REFRESH_INTERVAL);
    return () => clearInterval(timer);
  }, [refreshOverdueStatus]);
  
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/bags" element={<Bags />} />
          <Route path="/borrow" element={<Borrow />} />
          <Route path="/return" element={<Return />} />
          <Route path="/overdue" element={<Overdue />} />
          <Route path="/statistics" element={<Statistics />} />
        </Route>
      </Routes>
    </Router>
  );
}
