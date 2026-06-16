import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import KanbanBoard from '@/pages/KanbanBoard';
import MaterialsPage from '@/pages/MaterialsPage';
import MembersPage from '@/pages/MembersPage';
import ReportsPage from '@/pages/ReportsPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<KanbanBoard />} />
          <Route path="/materials" element={<MaterialsPage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
