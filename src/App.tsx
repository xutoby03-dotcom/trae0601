import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from '@/components/Layout';
import TeapotsPage from '@/pages/Teapots';
import BatchesPage from '@/pages/Batches';
import InspectionPage from '@/pages/Inspection';
import StatisticsPage from '@/pages/Statistics';
import { useTeaStore } from '@/store/useTeaStore';

export default function App() {
  const initData = useTeaStore((state) => state.initData);

  useEffect(() => {
    initData();
  }, [initData]);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<TeapotsPage />} />
          <Route path="/batches" element={<BatchesPage />} />
          <Route path="/inspection" element={<InspectionPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}
