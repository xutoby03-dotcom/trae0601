import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Dashboard from '@/pages/Dashboard';
import Plan from '@/pages/Plan';
import Equipment from '@/pages/Equipment';
import Checklist from '@/pages/Checklist';
import Statistics from '@/pages/Statistics';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-6 animate-fade-in">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/plan" element={<Plan />} />
            <Route path="/equipment" element={<Equipment />} />
            <Route path="/checklist" element={<Checklist />} />
            <Route path="/statistics" element={<Statistics />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
