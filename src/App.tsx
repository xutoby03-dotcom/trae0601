import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import Dashboard from '@/components/dashboard/Dashboard';
import MedicineList from '@/components/medicines/MedicineList';
import FamilyList from '@/components/family/FamilyList';
import TripList from '@/components/trips/TripList';
import TripWizard from '@/components/trips/TripWizard';
import PackingList from '@/components/trips/PackingList';
import TripSummary from '@/components/trips/TripSummary';
import { useAppStore } from '@/store/useAppStore';

export default function App() {
  const initIfEmpty = useAppStore((s) => s.initIfEmpty);

  useEffect(() => {
    initIfEmpty();
  }, [initIfEmpty]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/medicines" element={<MedicineList />} />
          <Route path="/family" element={<FamilyList />} />
          <Route path="/trips" element={<TripList />} />
          <Route path="/trips/new" element={<TripWizard />} />
          <Route path="/trips/:id" element={<PackingList />} />
          <Route path="/trips/:id/summary" element={<TripSummary />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
