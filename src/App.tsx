import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Layout from '@/components/Layout';
import DashboardPage from '@/pages/Dashboard/DashboardPage';
import ToysPage from '@/pages/ToysPage';
import ToyFormPage from '@/pages/ToyFormPage';
import ToyDetailPage from '@/pages/ToyDetailPage';
import CleaningPage from '@/pages/Cleaning/CleaningPage';
import CleaningFormPage from '@/pages/Cleaning/CleaningFormPage';
import TasksPage from '@/pages/Tasks/TasksPage';
import AlertsPage from '@/pages/Alerts/AlertsPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/toys" element={<ToysPage />} />
          <Route path="/toys/new" element={<ToyFormPage />} />
          <Route path="/toys/:id" element={<ToyDetailPage />} />
          <Route path="/toys/:id/edit" element={<ToyFormPage />} />
          <Route path="/cleaning" element={<CleaningPage />} />
          <Route path="/cleaning/new" element={<CleaningFormPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
