import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Remotes from './pages/Remotes';
import BorrowReturn from './pages/BorrowReturn';
import Statistics from './pages/Statistics';
import Purchase from './pages/Purchase';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/remotes" element={<Remotes />} />
          <Route path="/borrow-return" element={<BorrowReturn />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/purchase" element={<Purchase />} />
        </Routes>
      </Layout>
    </Router>
  );
}
