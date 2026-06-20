import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import ClassroomList from '@/pages/ClassroomList';
import ClassroomDetail from '@/pages/ClassroomDetail';
import ClassroomForm from '@/pages/ClassroomForm';
import InspectionList from '@/pages/InspectionList';
import InspectionForm from '@/pages/InspectionForm';
import RepairList from '@/pages/RepairList';
import RepairDetail from '@/pages/RepairDetail';
import RepairForm from '@/pages/RepairForm';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/classrooms" element={<ClassroomList />} />
          <Route path="/classrooms/new" element={<ClassroomForm />} />
          <Route path="/classrooms/:id" element={<ClassroomDetail />} />
          <Route path="/classrooms/:id/edit" element={<ClassroomForm />} />
          <Route path="/inspections" element={<InspectionList />} />
          <Route path="/inspections/new" element={<InspectionForm />} />
          <Route path="/repairs" element={<RepairList />} />
          <Route path="/repairs/new" element={<RepairForm />} />
          <Route path="/repairs/:id" element={<RepairDetail />} />
        </Route>
      </Routes>
    </Router>
  );
}
