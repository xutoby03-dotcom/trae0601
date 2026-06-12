import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import CoffeeBeans from '@/pages/CoffeeBeans';
import BrewRecords from '@/pages/BrewRecords';
import Stats from '@/pages/Stats';
import { useCoffeeStore } from '@/store/useCoffeeStore';
import { useEffect } from 'react';

export default function App() {
  const initFromStorage = useCoffeeStore((state) => state.initFromStorage);

  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  return (
    <Router>
      <div className="min-h-screen bg-[#F5EFE6]">
        <Navbar />
        <Routes>
          <Route path="/" element={<CoffeeBeans />} />
          <Route path="/brews" element={<BrewRecords />} />
          <Route path="/stats" element={<Stats />} />
        </Routes>
      </div>
    </Router>
  );
}
