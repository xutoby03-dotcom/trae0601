import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import FreezerList from '@/pages/FreezerList';
import FreezerDetail from '@/pages/FreezerDetail';
import FreezerForm from '@/pages/FreezerForm';
import InspectionList from '@/pages/InspectionList';
import InspectionForm from '@/pages/InspectionForm';
import LossReportList from '@/pages/LossReportList';
import LossReportDetail from '@/pages/LossReportDetail';
import Statistics from '@/pages/Statistics';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/freezers" element={<FreezerList />} />
          <Route path="/freezers/new" element={<FreezerForm />} />
          <Route path="/freezers/:id" element={<FreezerDetail />} />
          <Route path="/freezers/:id/edit" element={<FreezerForm />} />
          <Route path="/inspections" element={<InspectionList />} />
          <Route path="/inspections/new" element={<InspectionForm />} />
          <Route path="/loss-reports" element={<LossReportList />} />
          <Route path="/loss-reports/:id" element={<LossReportDetail />} />
          <Route path="/statistics" element={<Statistics />} />
        </Routes>
      </Layout>
    </Router>
  );
}
