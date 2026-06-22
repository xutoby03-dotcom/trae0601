import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TidalSamplingPage from '@/pages/TidalSamplingPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/tidal-sampling" replace />} />
        <Route path="/tidal-sampling" element={<TidalSamplingPage />} />
      </Routes>
    </Router>
  );
}
