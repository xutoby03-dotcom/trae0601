import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PlanList from '@/pages/PlanList';
import PlanForm from '@/pages/PlanForm';
import PlanDetail from '@/pages/PlanDetail';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PlanList />} />
        <Route path="/new" element={<PlanForm />} />
        <Route path="/edit/:id" element={<PlanForm />} />
        <Route path="/detail/:id" element={<PlanDetail />} />
      </Routes>
    </Router>
  );
}
