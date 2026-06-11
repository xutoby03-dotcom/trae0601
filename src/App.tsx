import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Home from '@/pages/Home';
import RegisterSeat from '@/pages/RegisterSeat';
import SeatDetail from '@/pages/SeatDetail';
import AdminLogin from '@/pages/AdminLogin';
import AdminPanel from '@/pages/AdminPanel';
import Statistics from '@/pages/Statistics';
import { Navbar } from '@/components/Navbar';

function Layout() {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith('/admin/login');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      {!hideNavbar && <Navbar />}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<RegisterSeat />} />
          <Route path="/seat/:id" element={<SeatDetail />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/stats" element={<Statistics />} />
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center text-slate-500">
              <div className="text-center">
                <p className="text-6xl font-black mb-2">404</p>
                <p>页面不存在</p>
              </div>
            </div>
          } />
        </Routes>
      </div>
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
