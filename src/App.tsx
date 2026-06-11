import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import MovieListPage from './pages/MovieListPage';
import ArrangementPage from './pages/ArrangementPage';
import StatsPage from './pages/StatsPage';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#1A0B2E] text-white">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `repeating-linear-gradient(
                90deg,
                transparent,
                transparent 20px,
                rgba(255,255,255,0.5) 20px,
                rgba(255,255,255,0.5) 21px
              )`,
            }}
          />
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-pink-600/20 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10">
          <Navigation />
          <Routes>
            <Route path="/" element={<MovieListPage />} />
            <Route path="/arrangement" element={<ArrangementPage />} />
            <Route path="/stats" element={<StatsPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
