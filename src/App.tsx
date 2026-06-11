import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Home from '@/pages/Home';
import SubmitTicket from '@/pages/SubmitTicket';
import TicketDetail from '@/pages/TicketDetail';
import Workbench from '@/pages/Workbench';
import Admin from '@/pages/Admin';
import { useTicketStore } from '@/store/useTicketStore';
import { useEffect } from 'react';

function RoleRedirect() {
  const { role } = useTicketStore();
  if (role === 'worker') return <Navigate to="/workbench" replace />;
  if (role === 'admin') return <Navigate to="/admin" replace />;
  return <Navigate to="/" replace />;
}

export default function App() {
  const { recalcQueuePositions } = useTicketStore();

  useEffect(() => {
    recalcQueuePositions();
  }, [recalcQueuePositions]);

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/submit" element={<SubmitTicket />} />
            <Route path="/ticket/:id" element={<TicketDetail />} />
            <Route path="/workbench" element={<Workbench />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<RoleRedirect />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
