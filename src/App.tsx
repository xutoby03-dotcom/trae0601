import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Container from '@/components/Layout/Container';
import Dashboard from '@/pages/Dashboard';
import Records from '@/pages/Records';
import NewRecord from '@/pages/NewRecord';
import EditRecord from '@/pages/EditRecord';
import ReviseRecord from '@/pages/ReviseRecord';

export default function App() {
  return (
    <Router>
      <Container>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/records" element={<Records />} />
          <Route path="/records/new" element={<NewRecord />} />
          <Route path="/records/:id/edit" element={<EditRecord />} />
          <Route path="/records/:id/revise" element={<ReviseRecord />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </Container>
    </Router>
  );
}
