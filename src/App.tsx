import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import PotDetail from '@/pages/PotDetail';
import CookingRecord from '@/pages/CookingRecord';
import Production from '@/pages/Production';
import Statistics from '@/pages/Statistics';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pot/:id" element={<PotDetail />} />
          <Route path="/cooking-record" element={<CookingRecord />} />
          <Route path="/production" element={<Production />} />
          <Route path="/statistics" element={<Statistics />} />
        </Route>
      </Routes>
    </Router>
  );
}
