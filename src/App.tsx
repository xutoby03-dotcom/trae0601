import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import HomePage from '@/pages/HomePage';
import DesignerPage from '@/pages/DesignerPage';
import PracticePage from '@/pages/PracticePage';
import ReportPage from '@/pages/ReportPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/designer" element={<DesignerPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/report" element={<ReportPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
