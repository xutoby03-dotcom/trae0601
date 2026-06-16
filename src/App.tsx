import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import BudgetList from '@/pages/BudgetList';
import BudgetDetail from '@/pages/BudgetDetail';
import BudgetNew from '@/pages/BudgetNew';
import ReimbursementList from '@/pages/ReimbursementList';
import ReimbursementDetail from '@/pages/ReimbursementDetail';
import ReimbursementNew from '@/pages/ReimbursementNew';
import Statistics from '@/pages/Statistics';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/budgets" element={<BudgetList />} />
          <Route path="/budgets/new" element={<BudgetNew />} />
          <Route path="/budgets/:id" element={<BudgetDetail />} />
          <Route path="/reimbursements" element={<ReimbursementList />} />
          <Route path="/reimbursements/new" element={<ReimbursementNew />} />
          <Route path="/reimbursements/:id" element={<ReimbursementDetail />} />
          <Route path="/statistics" element={<Statistics />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
