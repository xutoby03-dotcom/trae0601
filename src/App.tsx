import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import DashboardPage from './pages/DashboardPage';
import EquipmentPage from './pages/EquipmentPage';
import CalibrationPage from './pages/CalibrationPage';
import ListeningPage from './pages/ListeningPage';
import AnalysisPage from './pages/AnalysisPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/equipment" element={<EquipmentPage />} />
          <Route path="/calibration" element={<CalibrationPage />} />
          <Route path="/listening" element={<ListeningPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
