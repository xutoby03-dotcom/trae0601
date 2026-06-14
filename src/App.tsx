import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import Dashboard from '@/pages/Dashboard';
import UmbrellaList from '@/pages/umbrellas/UmbrellaList';
import UmbrellaForm from '@/pages/umbrellas/UmbrellaForm';
import LendPage from '@/pages/LendPage';
import ReturnPage from '@/pages/ReturnPage';
import OverdueList from '@/pages/OverdueList';
import Statistics from '@/pages/Statistics';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/umbrellas" element={<UmbrellaList />} />
          <Route path="/umbrellas/new" element={<UmbrellaForm />} />
          <Route path="/umbrellas/:id/edit" element={<UmbrellaForm />} />
          <Route path="/lend" element={<LendPage />} />
          <Route path="/return" element={<ReturnPage />} />
          <Route path="/overdue" element={<OverdueList />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="*" element={<Dashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}
