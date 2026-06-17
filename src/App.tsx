import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import Dashboard from '@/pages/Dashboard';
import BoxList from '@/pages/BoxList';
import BoxDetail from '@/pages/BoxDetail';
import BoxForm from '@/pages/BoxForm';
import ClothingList from '@/pages/ClothingList';
import ClothingDetail from '@/pages/ClothingDetail';
import ClothingForm from '@/pages/ClothingForm';
import PendingList from '@/pages/PendingList';
import Reminders from '@/pages/Reminders';

function AppContent() {
  const initData = useStore((state) => state.initData);

  useEffect(() => {
    initData();
  }, [initData]);

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/boxes" element={<BoxList />} />
      <Route path="/boxes/new" element={<BoxForm />} />
      <Route path="/boxes/:id" element={<BoxDetail />} />
      <Route path="/boxes/:id/edit" element={<BoxForm />} />
      <Route path="/clothes" element={<ClothingList />} />
      <Route path="/clothes/new" element={<ClothingForm />} />
      <Route path="/clothes/:id" element={<ClothingDetail />} />
      <Route path="/clothes/:id/edit" element={<ClothingForm />} />
      <Route path="/pending" element={<PendingList />} />
      <Route path="/reminders" element={<Reminders />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
