import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import AppLayout from '@/components/Layout/AppLayout';
import Home from '@/pages/Home';
import Medicines from '@/pages/Medicines';
import MedicineFormPage from '@/pages/MedicineFormPage';
import Records from '@/pages/Records';
import Statistics from '@/pages/Statistics';
import PackingModal from '@/components/Packing/PackingModal';
import { useAppStore } from '@/store/useAppStore';

function AppInitializer() {
  const initStore = useAppStore((s) => s.initStore);
  useEffect(() => {
    initStore();
  }, [initStore]);
  return null;
}

export default function App() {
  return (
    <Router>
      <AppInitializer />
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />}>
            <Route path="packing/:date/:slot" element={<PackingModal />} />
          </Route>
          <Route path="/medicines" element={<Medicines />} />
          <Route path="/medicines/new" element={<MedicineFormPage />} />
          <Route path="/medicines/:id/edit" element={<MedicineFormPage />} />
          <Route path="/records" element={<Records />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/packing/:date/:slot" element={<PackingModalPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

function PackingModalPage() {
  return (
    <>
      <Home />
      <PackingModal />
    </>
  );
}
