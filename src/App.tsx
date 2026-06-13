import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Allocation from '@/pages/Allocation';
import Supplies from '@/pages/Supplies';
import Members from '@/pages/Members';
import Checklist from '@/pages/Checklist';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Allocation />} />
          <Route path="/supplies" element={<Supplies />} />
          <Route path="/members" element={<Members />} />
          <Route path="/checklist" element={<Checklist />} />
        </Route>
      </Routes>
    </Router>
  );
}
