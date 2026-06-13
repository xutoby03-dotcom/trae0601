import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DeviceList from './pages/DeviceList';
import DeviceForm from './pages/DeviceForm';
import DeviceDetail from './pages/DeviceDetail';
import RecordList from './pages/RecordList';
import RecordForm from './pages/RecordForm';
import Inventory from './pages/Inventory';
import Statistics from './pages/Statistics';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="devices" element={<DeviceList />} />
          <Route path="devices/new" element={<DeviceForm />} />
          <Route path="devices/:id" element={<DeviceDetail />} />
          <Route path="devices/:id/edit" element={<DeviceForm />} />
          <Route path="records" element={<RecordList />} />
          <Route path="records/new" element={<RecordForm />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="statistics" element={<Statistics />} />
        </Route>
      </Routes>
    </Router>
  );
}
