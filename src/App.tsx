import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Chairs from './pages/Chairs';
import Orders from './pages/Orders';
import Repairs from './pages/Repairs';
import SeatMap from './pages/SeatMap';
import Statistics from './pages/Statistics';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="chairs" element={<Chairs />} />
        <Route path="orders" element={<Orders />} />
        <Route path="repairs" element={<Repairs />} />
        <Route path="seatmap" element={<SeatMap />} />
        <Route path="statistics" element={<Statistics />} />
      </Route>
    </Routes>
  );
}
