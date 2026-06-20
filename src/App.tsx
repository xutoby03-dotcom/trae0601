import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import Dashboard from '@/pages/Dashboard';
import PropFlowPage from '@/pages/PropFlowPage';
import IssuesPage from '@/pages/IssuesPage';
import ChecklistPage from '@/pages/ChecklistPage';
import { useAppStore } from '@/store/appStore';

function AppContent() {
  const { init, darkMode } = useAppStore();

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <PageLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/play/:playId/scene/:sceneId" element={<PropFlowPage />} />
        <Route path="/issues" element={<IssuesPage />} />
        <Route path="/checklist" element={<ChecklistPage />} />
      </Routes>
    </PageLayout>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
