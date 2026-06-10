import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import QueueDisplay from '@/pages/QueueDisplay';
import StaffPanel from '@/pages/StaffPanel';
import TicketForm from '@/pages/TicketForm';
import TicketDetail from '@/pages/TicketDetail';
import Stats from '@/pages/Stats';
import Setup from '@/pages/Setup';
import { useQueueStore } from '@/store/queueStore';

function App() {
  const { queue, clearOldTickets } = useQueueStore();

  useEffect(() => {
    clearOldTickets();
  }, [clearOldTickets]);

  if (!queue) {
    return (
      <Routes>
        <Route path="/setup" element={<Setup />} />
        <Route path="*" element={<Navigate to="/setup" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<QueueDisplay />} />
      <Route path="/staff" element={<StaffPanel />} />
      <Route path="/ticket" element={<TicketForm />} />
      <Route path="/ticket/:id" element={<TicketDetail />} />
      <Route path="/stats" element={<Stats />} />
      <Route path="/setup" element={<Setup />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
