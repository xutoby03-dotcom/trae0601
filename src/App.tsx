import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import DashboardPage from '@/pages/DashboardPage';
import FacilitiesPage from '@/pages/FacilitiesPage';
import FacilityDetailPage from '@/pages/FacilityDetailPage';
import FacilityFormPage from '@/pages/FacilityFormPage';
import InspectionsPage from '@/pages/InspectionsPage';
import InspectionDetailPage from '@/pages/InspectionDetailPage';
import IssuesPage from '@/pages/IssuesPage';
import IssueReportPage from '@/pages/IssueReportPage';
import RepairsPage from '@/pages/RepairsPage';
import RepairDetailPage from '@/pages/RepairDetailPage';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/facilities" element={<FacilitiesPage />} />
          <Route path="/facilities/new" element={<FacilityFormPage />} />
          <Route path="/facilities/:id" element={<FacilityDetailPage />} />
          <Route path="/facilities/:id/edit" element={<FacilityFormPage />} />
          <Route path="/inspections" element={<InspectionsPage />} />
          <Route path="/inspections/:id" element={<InspectionDetailPage />} />
          <Route path="/issues" element={<IssuesPage />} />
          <Route path="/issues/new" element={<IssueReportPage />} />
          <Route path="/repairs" element={<RepairsPage />} />
          <Route path="/repairs/new" element={<RepairDetailPage />} />
          <Route path="/repairs/:id" element={<RepairDetailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
