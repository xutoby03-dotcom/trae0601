import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import RegisterList from '@/pages/RegisterList';
import RegisterForm from '@/pages/RegisterForm';
import HandoverList from '@/pages/HandoverList';
import HandoverCreate from '@/pages/HandoverCreate';
import HandoverDetail from '@/pages/HandoverDetail';
import TransactionList from '@/pages/TransactionList';
import TransactionForm from '@/pages/TransactionForm';
import Statistics from '@/pages/Statistics';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/registers" element={<RegisterList />} />
          <Route path="/registers/new" element={<RegisterForm />} />
          <Route path="/registers/:id/edit" element={<RegisterForm />} />
          <Route path="/handovers" element={<HandoverList />} />
          <Route path="/handovers/new" element={<HandoverCreate />} />
          <Route path="/handovers/:id" element={<HandoverDetail />} />
          <Route path="/transactions" element={<TransactionList />} />
          <Route path="/transactions/new" element={<TransactionForm />} />
          <Route path="/statistics" element={<Statistics />} />
        </Route>
      </Routes>
    </Router>
  );
}
