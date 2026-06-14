import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAppStore } from '@/store/useAppStore';
import Dashboard from '@/pages/Dashboard';
import ACList from '@/pages/ACList';
import ACNew from '@/pages/ACNew';
import ACEdit from '@/pages/ACEdit';
import RecordList from '@/pages/RecordList';
import RecordNew from '@/pages/RecordNew';

export default function App() {
  const { initData, isLoading, error } = useAppStore();

  useEffect(() => {
    initData();
  }, [initData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">加载失败</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/air-conditioners" element={<ACList />} />
          <Route path="/air-conditioners/new" element={<ACNew />} />
          <Route path="/air-conditioners/:id" element={<ACEdit />} />
          <Route path="/cleaning-records" element={<RecordList />} />
          <Route path="/cleaning-records/new/:acId" element={<RecordNew />} />
        </Route>
      </Routes>
    </Router>
  );
}
