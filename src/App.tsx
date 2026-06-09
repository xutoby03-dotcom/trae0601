import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Devices from '@/pages/Devices';
import DeviceForm from '@/pages/DeviceForm';
import DeviceDetail from '@/pages/DeviceDetail';
import Scenes from '@/pages/Scenes';
import SceneForm from '@/pages/SceneForm';
import SceneDetail from '@/pages/SceneDetail';
import Troubleshoot from '@/pages/Troubleshoot';
import Stats from '@/pages/Stats';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/devices/new" element={<DeviceForm />} />
          <Route path="/devices/:id" element={<DeviceDetail />} />
          <Route path="/devices/:id/edit" element={<DeviceForm />} />
          <Route path="/scenes" element={<Scenes />} />
          <Route path="/scenes/new" element={<SceneForm />} />
          <Route path="/scenes/:id" element={<SceneDetail />} />
          <Route path="/scenes/:id/edit" element={<SceneForm />} />
          <Route path="/troubleshoot" element={<Troubleshoot />} />
          <Route path="/stats" element={<Stats />} />
        </Routes>
      </Layout>
    </Router>
  );
}
