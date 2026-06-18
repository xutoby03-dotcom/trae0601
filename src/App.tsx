import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { CoatList } from '@/pages/CoatList';
import { LendingList } from '@/pages/LendingList';
import { ReturnCheck, ReturnList } from '@/pages/ReturnCheck';
import { CleaningManagement } from '@/pages/CleaningManagement';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="coats" element={<CoatList />} />
          <Route path="lendings" element={<LendingList />} />
          <Route path="return" element={<ReturnList />} />
          <Route path="return/:lendingId" element={<ReturnCheck />} />
          <Route path="cleaning" element={<CleaningManagement />} />
        </Route>
      </Routes>
    </Router>
  );
}
