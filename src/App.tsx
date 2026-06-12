import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.js';
import Dashboard from './pages/Dashboard.js';
import Rooms from './pages/Rooms.js';
import Borrows from './pages/Borrows.js';
import Exceptions from './pages/Exceptions.js';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/borrows" element={<Borrows />} />
          <Route path="/exceptions" element={<Exceptions />} />
        </Route>
      </Routes>
    </Router>
  );
}
