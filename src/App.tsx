import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.js';
import Dashboard from './pages/Dashboard.js';
import GardenBeds from './pages/GardenBeds.js';
import Schedule from './pages/Schedule.js';
import CheckIn from './pages/CheckIn.js';
import Anomalies from './pages/Anomalies.js';
import Profile from './pages/Profile.js';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/garden-beds" element={<GardenBeds />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/check-in" element={<CheckIn />} />
          <Route path="/anomalies" element={<Anomalies />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}
