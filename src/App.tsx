import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from '@/pages/Home';
import Inventory from '@/pages/Inventory';
import Planner from '@/pages/Planner';
import Warnings from '@/pages/Warnings';
import FoodDetail from '@/pages/FoodDetail';
import BottomNav from '@/components/BottomNav';
import { useEffect } from 'react';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Layout() {
  const location = useLocation();
  const showNav = !location.pathname.startsWith('/inventory/');

  return (
    <div className="font-body antialiased text-warm-900">
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/inventory/:id" element={<FoodDetail />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/warnings" element={<Warnings />} />
      </Routes>
      {showNav && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}
