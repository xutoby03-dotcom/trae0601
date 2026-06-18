import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SeatMap from '@/pages/SeatMap';
import FeedbackSubmit from '@/pages/FeedbackSubmit';
import AdminPanel from '@/pages/AdminPanel';
import Dashboard from '@/pages/Dashboard';
import { Shield } from 'lucide-react';

function NavLink() {
  return (
    <Link
      to="/admin"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-slate-800 text-white rounded-full shadow-lg hover:bg-slate-700 transition-all hover:scale-105"
    >
      <Shield className="w-5 h-5" />
      <span className="text-sm font-medium">管理员入口</span>
    </Link>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<><SeatMap /><NavLink /></>} />
        <Route path="/feedback" element={<FeedbackSubmit />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}
