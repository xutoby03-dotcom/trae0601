import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SampleList from '@/pages/SampleList';
import SampleDetail from '@/pages/SampleDetail';
import SampleForm from '@/pages/SampleForm';
import FeedbackForm from '@/pages/FeedbackForm';
import Dashboard from '@/pages/Dashboard';
import { useStore } from '@/store';

export default function App() {
  const initData = useStore((state) => state.initData);

  useEffect(() => {
    initData();
  }, [initData]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<SampleList />} />
        <Route path="/sample/new" element={<SampleForm />} />
        <Route path="/sample/:id" element={<SampleDetail />} />
        <Route path="/sample/:id/edit" element={<SampleForm />} />
        <Route path="/sample/:sampleId/feedback/new" element={<FeedbackForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
