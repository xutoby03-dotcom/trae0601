import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Dashboard from '@/pages/Dashboard';
import Devices from '@/pages/Devices';
import DeviceDetail from '@/pages/DeviceDetail';
import Records from '@/pages/Records';
import Checklist from '@/pages/Checklist';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/devices" element={<Devices />} />
            <Route path="/devices/:id" element={<DeviceDetail />} />
            <Route path="/records" element={<Records />} />
            <Route path="/checklist" element={<Checklist />} />
          </Routes>
        </main>
        <footer className="border-t border-warm-100 bg-white/50 mt-8">
          <div className="container py-6 text-center text-sm text-warm-400">
            <p>🦻 助听器管家 · 用心守护家人听力健康</p>
            <p className="mt-1 text-xs">数据安全存储在您的浏览器本地，无需担心隐私问题</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}
