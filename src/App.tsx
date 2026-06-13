import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import ComplaintList from '@/pages/ComplaintList';
import ComplaintNew from '@/pages/ComplaintNew';
import ComplaintDetail from '@/pages/ComplaintDetail';
import Heatmap from '@/pages/Heatmap';
import { useComplaintStore } from '@/store/useComplaintStore';

export default function App() {
  const initComplaints = useComplaintStore((state) => state.initComplaints);
  const isLoading = useComplaintStore((state) => state.isLoading);

  useEffect(() => {
    initComplaints();
  }, [initComplaints]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/complaints" element={<ComplaintList />} />
          <Route path="/complaints/new" element={<ComplaintNew />} />
          <Route path="/complaints/:id" element={<ComplaintDetail />} />
          <Route path="/heatmap" element={<Heatmap />} />
        </Route>
      </Routes>
    </Router>
  );
}
