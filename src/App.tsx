import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { FurnitureList } from './pages/FurnitureList';
import { FurnitureDetail } from './pages/FurnitureDetail';
import { RepairList } from './pages/RepairList';
import { InspectionList } from './pages/InspectionList';
import { RoomInspection } from './pages/RoomInspection';
import { MaintenanceList } from './pages/MaintenanceList';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/furniture" element={<FurnitureList />} />
          <Route path="/furniture/:id" element={<FurnitureDetail />} />
          <Route path="/repair" element={<RepairList />} />
          <Route path="/inspection" element={<InspectionList />} />
          <Route path="/inspection/:roomId" element={<RoomInspection />} />
          <Route path="/maintenance" element={<MaintenanceList />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
