import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import Reading from '@/pages/Reading';
import Interpretation from '@/pages/Interpretation';
import History from '@/pages/History';
import { StarBackground } from '@/components/StarBackground';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/hooks/useTheme';

function AppContent() {
  useTheme();

  return (
    <div className="min-h-screen">
      <StarBackground />
      <ThemeToggle />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reading/:spreadId" element={<Reading />} />
        <Route path="/reading/:spreadId/interpretation" element={<Interpretation />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
