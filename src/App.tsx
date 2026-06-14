import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from '@/components/Layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import BatchList from '@/pages/Batches/BatchList';
import BatchForm from '@/pages/Batches/BatchForm';
import JarList from '@/pages/Jars/JarList';
import JarNewForm from '@/pages/Jars/JarNewForm';
import JarDetail from '@/pages/Jars/JarDetail';
import Statistics from '@/pages/Statistics';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/batches" element={<BatchList />} />
          <Route path="/batches/new" element={<BatchForm />} />
          <Route path="/batches/:id/edit" element={<BatchForm />} />
          <Route path="/jars" element={<JarList />} />
          <Route path="/jars/new" element={<JarNewForm />} />
          <Route path="/jars/:id" element={<JarDetail />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="*" element={<Dashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}
