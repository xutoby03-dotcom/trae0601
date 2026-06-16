import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Players from '@/pages/Players';
import Scripts from '@/pages/Scripts';
import Session from '@/pages/Session';
import Stats from '@/pages/Stats';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/players" replace />} />
          <Route path="players" element={<Players />} />
          <Route path="scripts" element={<Scripts />} />
          <Route path="session" element={<Session />} />
          <Route path="stats" element={<Stats />} />
        </Route>
      </Routes>
    </Router>
  );
}
