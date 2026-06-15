import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import KeyListPage from './pages/KeyListPage';
import KeyDetailPage from './pages/KeyDetailPage';
import KeyFormPage from './pages/KeyFormPage';
import RemindersPage from './pages/RemindersPage';
import SettingsPage from './pages/SettingsPage';
import { useStore } from './store/useStore';

function App() {
  const generateReminders = useStore((s) => s.generateReminders);

  useEffect(() => {
    generateReminders();
  }, [generateReminders]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/keys" element={<KeyListPage />} />
          <Route path="/keys/new" element={<KeyFormPage />} />
          <Route path="/keys/:id" element={<KeyDetailPage />} />
          <Route path="/keys/:id/edit" element={<KeyFormPage />} />
          <Route path="/reminders" element={<RemindersPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
