import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout';
import Dashboard from '@/pages/Dashboard';
import Cases from '@/pages/Cases';
import NewCase from '@/pages/Cases/NewCase';
import CaseDetail from '@/pages/Cases/CaseDetail';
import NewVisit from '@/pages/Visits/NewVisit';
import Alerts from '@/pages/Alerts';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/cases" element={<Cases />} />
          <Route path="/cases/new" element={<NewCase />} />
          <Route path="/cases/:id" element={<CaseDetail />} />
          <Route path="/cases/:id/visits/new" element={<NewVisit />} />
          <Route path="/alerts" element={<Alerts />} />
        </Route>
      </Routes>
    </Router>
  );
}
