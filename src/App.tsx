import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Booking from '@/pages/Booking';
import Admin from '@/pages/Admin';
import Dashboard from '@/pages/Dashboard';
import BookingModal from '@/components/BookingModal';

export default function App() {
  return (
    <Router>
      <Layout />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BookingModal />
    </Router>
  );
}
