import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from '@/components/Layout/Navbar';
import Dashboard from '@/pages/Dashboard';
import Rooms from '@/pages/Rooms';
import WashingFlow from '@/pages/WashingFlow';
import Statistics from '@/pages/Statistics';
import { useAppStore } from '@/store';

export default function App() {
  const { init, rooms } = useAppStore();

  useEffect(() => {
    init();
  }, [init]);

  return (
    <Router>
      <div className="min-h-screen bg-warm-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/rooms/:roomId/curtain/:curtainId/wash" element={<WashingFlow />} />
          <Route path="/statistics" element={<Statistics />} />
        </Routes>
      </div>
    </Router>
  );
}
