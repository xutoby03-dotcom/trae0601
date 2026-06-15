import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import Home from '@/pages/Home';
import ReturnList from '@/pages/ReturnList';
import ReturnCheck from '@/pages/ReturnCheck';
import Admin from '@/pages/Admin';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-stone-50">
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/return" element={<ReturnList />} />
          <Route path="/return/:id" element={<ReturnCheck />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </Router>
  );
}
