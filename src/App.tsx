import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import NewComplaint from '@/pages/NewComplaint';
import ComplaintDetail from '@/pages/ComplaintDetail';
import Scripts from '@/pages/Scripts';
import Stats from '@/pages/Stats';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/complaint/new" element={<NewComplaint />} />
          <Route path="/complaint/:id" element={<ComplaintDetail />} />
          <Route path="/scripts" element={<Scripts />} />
          <Route path="/stats" element={<Stats />} />
        </Routes>
      </Layout>
    </Router>
  );
}
