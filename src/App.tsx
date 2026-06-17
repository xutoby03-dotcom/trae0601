import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { ArchiveList } from '@/pages/ArchiveList';
import { ArchiveDetail } from '@/pages/ArchiveDetail';
import { ArchiveNew } from '@/pages/ArchiveNew';
import { BorrowApply } from '@/pages/BorrowApply';
import { BorrowApprove } from '@/pages/BorrowApprove';
import { BorrowReturn } from '@/pages/BorrowReturn';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="archives" element={<ArchiveList />} />
          <Route path="archives/new" element={<ArchiveNew />} />
          <Route path="archives/:id" element={<ArchiveDetail />} />
          <Route path="borrow/apply" element={<BorrowApply />} />
          <Route path="borrow/approve" element={<BorrowApprove />} />
          <Route path="borrow/return" element={<BorrowReturn />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}
