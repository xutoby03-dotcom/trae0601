import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import NotifyToast from '@/components/NotifyToast';
import Dashboard from '@/pages/Dashboard';
import ReportFault from '@/pages/ReportFault';
import FaultDetail from '@/pages/FaultDetail';
import Statistics from '@/pages/Statistics';
import Subscribe from '@/pages/Subscribe';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/report" element={<ReportFault />} />
            <Route path="/fault/:id" element={<FaultDetail />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/subscribe" element={<Subscribe />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </main>
        <NotifyToast />
      </div>
    </Router>
  );
}
