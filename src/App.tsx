import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import SchedulePage from '@/pages/SchedulePage';
import PreRacePage from '@/pages/PreRacePage';
import ReportPage from '@/pages/ReportPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/pre-race" element={<PreRacePage />} />
          <Route path="/report" element={<ReportPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
