import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Home from '@/pages/Home';
import ActivityDetail from '@/pages/ActivityDetail';
import CreateActivity from '@/pages/CreateActivity';
import ManageActivity from '@/pages/ManageActivity';
import CheckIn from '@/pages/CheckIn';
import Stats from '@/pages/Stats';
import Navbar from '@/components/Navbar';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Layout() {
  const location = useLocation();
  const showNavbar = !location.pathname.startsWith('/activity/') || location.pathname === '/';

  return (
    <div className="min-h-screen bg-cream-100">
      {showNavbar && <Navbar />}
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/activity/:id" element={<ActivityDetail />} />
        <Route path="/admin/create" element={<CreateActivity />} />
        <Route path="/admin/manage/:id" element={<ManageActivity />} />
        <Route path="/admin/checkin/:id" element={<CheckIn />} />
        <Route path="/admin/stats" element={<Stats />} />
      </Routes>
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
