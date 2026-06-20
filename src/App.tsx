import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import EquipmentList, { EquipmentDetail } from '@/pages/Equipment';
import InspectionList, { InspectionExecute } from '@/pages/Inspection';
import TasksPage, { TaskDetail } from '@/pages/Tasks';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/equipment" element={<EquipmentList />} />
          <Route path="/equipment/:id" element={<EquipmentDetail />} />
          <Route path="/inspection" element={<InspectionList />} />
          <Route path="/inspection/:id" element={<InspectionExecute />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/tasks/:id" element={<TaskDetail />} />
        </Route>
      </Routes>
    </Router>
  );
}
