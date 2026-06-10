import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Home from '@/pages/Home';
import CreateRoute from '@/pages/CreateRoute';
import RouteDetail from '@/pages/RouteDetail';
import Checkin from '@/pages/Checkin';
import JoinRide from '@/pages/JoinRide';
import Stats from '@/pages/Stats';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div
          className="pointer-events-none fixed inset-0 opacity-[0.15]"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(16, 185, 129, 0.35), transparent)',
          }}
        />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateRoute />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/route/:id" element={<RouteDetail />} />
          <Route path="/route/:id/checkin" element={<Checkin />} />
          <Route path="/route/:id/join" element={<JoinRide />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}
