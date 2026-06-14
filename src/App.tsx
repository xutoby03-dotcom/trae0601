import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import TripEditor from '@/pages/TripEditor';
import PersonDetail from '@/pages/PersonDetail';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/trip" element={<TripEditor />} />
        <Route path="/person/:id" element={<PersonDetail />} />
      </Routes>
    </Router>
  );
}
