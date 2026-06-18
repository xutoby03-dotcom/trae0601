import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import RoomList from '@/pages/RoomList';
import RoomForm from '@/pages/RoomForm';
import RoomDetail from '@/pages/RoomDetail';
import InventoryList from '@/pages/InventoryList';
import InspectionList from '@/pages/InspectionList';
import InspectionForm from '@/pages/InspectionForm';
import TaskList from '@/pages/TaskList';
import TaskDetail from '@/pages/TaskDetail';
import FeedbackForm from '@/pages/FeedbackForm';
import Statistics from '@/pages/Statistics';
import { useAppStore } from '@/store';

function AppRoutes() {
  const checkLowStock = useAppStore((state) => state.checkLowStock);

  useEffect(() => {
    checkLowStock();
  }, [checkLowStock]);

  return (
    <Routes>
      <Route path="/feedback" element={<FeedbackForm />} />
      <Route path="/feedback/:roomId" element={<FeedbackForm />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/rooms" element={<RoomList />} />
        <Route path="/rooms/new" element={<RoomForm />} />
        <Route path="/rooms/:id" element={<RoomDetail />} />
        <Route path="/rooms/:id/edit" element={<RoomForm />} />
        <Route path="/inventory" element={<InventoryList />} />
        <Route path="/inventory/:roomId" element={<InventoryList />} />
        <Route path="/inspection" element={<InspectionList />} />
        <Route path="/inspection/:roomId" element={<InspectionForm />} />
        <Route path="/tasks" element={<TaskList />} />
        <Route path="/tasks/:id" element={<TaskDetail />} />
        <Route path="/statistics" element={<Statistics />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
