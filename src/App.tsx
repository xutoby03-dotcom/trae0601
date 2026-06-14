import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Points from '@/pages/Points';
import Tasks from '@/pages/Tasks';
import Issues from '@/pages/Issues';
import Recovery from '@/pages/Recovery';
import Statistics from '@/pages/Statistics';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/points" element={<Points />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/issues" element={<Issues />} />
          <Route path="/recovery" element={<Recovery />} />
          <Route path="/statistics" element={<Statistics />} />
        </Routes>
      </Layout>
    </Router>
  );
}
