import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import RoomList from '@/pages/RoomList';
import RoomForm from '@/pages/RoomForm';
import InspectionForm from '@/pages/InspectionForm';
import InspectionHistory from '@/pages/InspectionHistory';
import SupplyList from '@/pages/SupplyList';
import Statistics from '@/pages/Statistics';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/rooms" element={<RoomList />} />
          <Route path="/rooms/new" element={<RoomForm />} />
          <Route path="/rooms/:id/edit" element={<RoomForm />} />
          <Route path="/inspection" element={<InspectionForm />} />
          <Route path="/inspection/history" element={<InspectionHistory />} />
          <Route path="/supply" element={<SupplyList />} />
          <Route path="/statistics" element={<Statistics />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
