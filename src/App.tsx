import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Equipment from '@/pages/Equipment';
import Calibration from '@/pages/Calibration';
import Schedule from '@/pages/Schedule';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/equipment" replace />} />
          <Route path="/equipment" element={<Equipment />} />
          <Route path="/calibration" element={<Calibration />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="*" element={<Navigate to="/equipment" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
