import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/Layout/MainLayout';
import Dashboard from '@/pages/Dashboard';
import Members from '@/pages/Members';
import MemberForm from '@/pages/Members/MemberForm';
import Plans from '@/pages/Plans';
import PlanDetail from '@/pages/Plans/PlanDetail';
import PlanForm from '@/pages/Plans/PlanForm';
import SeatingArrangement from '@/pages/Seating';
import ExportCenter from '@/pages/Export';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          
          <Route path="/members" element={<Members />} />
          <Route path="/members/new" element={<MemberForm />} />
          <Route path="/members/:id/edit" element={<MemberForm />} />
          
          <Route path="/plans" element={<Plans />} />
          <Route path="/plans/new" element={<PlanForm />} />
          <Route path="/plans/:id" element={<PlanDetail />} />
          <Route path="/plans/:id/seating" element={<SeatingArrangement />} />
          <Route path="/plans/:id/export" element={<ExportCenter />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
