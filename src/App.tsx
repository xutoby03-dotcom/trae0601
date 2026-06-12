import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import Dashboard from '@/pages/Dashboard';
import Bouquets from '@/pages/Bouquets';
import Reservations from '@/pages/Reservations';
import Records from '@/pages/Records';

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-cream-50 font-sans">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/bouquets" element={<Bouquets />} />
            <Route path="/reservations" element={<Reservations />} />
            <Route path="/records" element={<Records />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
