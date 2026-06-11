import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import Restock from '@/pages/Restock';
import Stats from '@/pages/Stats';
import SeasoningForm from '@/components/seasoning/SeasoningForm';
import { useSeasoningStore } from '@/store/useSeasoningStore';

export default function App() {
  const initMockData = useSeasoningStore((state) => state.initMockData);
  const isInitialized = useSeasoningStore((state) => state.isInitialized);

  useEffect(() => {
    if (!isInitialized) {
      initMockData();
    }
  }, [isInitialized, initMockData]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/add" element={<SeasoningForm />} />
        <Route path="/restock" element={<Restock />} />
        <Route path="/stats" element={<Stats />} />
      </Routes>
    </Router>
  );
}
