import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import Dashboard from '@/pages/Dashboard';
import PatrolConfig from '@/pages/PatrolConfig';
import PatrolCheckIn from '@/pages/PatrolCheckIn';
import ExceptionList from '@/pages/ExceptionList';
import MissedPoints from '@/pages/MissedPoints';
import Statistics from '@/pages/Statistics';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/config" element={<PatrolConfig />} />
          <Route path="/patrol" element={<PatrolCheckIn />} />
          <Route path="/exceptions" element={<ExceptionList />} />
          <Route path="/missed" element={<MissedPoints />} />
          <Route path="/statistics" element={<Statistics />} />
        </Route>
      </Routes>
    </Router>
  );
}
