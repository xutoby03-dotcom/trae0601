import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import ShoeForm from '@/pages/ShoeForm';
import ShoeDetail from '@/pages/ShoeDetail';
import RunForm from '@/pages/RunForm';
import Stats from '@/pages/Stats';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shoe/new" element={<ShoeForm />} />
          <Route path="/shoe/:id" element={<ShoeDetail />} />
          <Route path="/shoe/:id/edit" element={<ShoeForm />} />
          <Route path="/run/new" element={<RunForm />} />
          <Route path="/stats" element={<Stats />} />
        </Route>
      </Routes>
    </Router>
  );
}
