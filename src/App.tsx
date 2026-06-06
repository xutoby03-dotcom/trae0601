import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from '@/components/layout/Navigation';
import Home from '@/pages/Home';
import MetronomePage from '@/pages/Metronome';
import RhythmTraining from '@/pages/RhythmTraining';
import EarTraining from '@/pages/EarTraining';
import ChordTraining from '@/pages/ChordTraining';
import Statistics from '@/pages/Statistics';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="pb-24">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/metronome" element={<MetronomePage />} />
            <Route path="/rhythm" element={<RhythmTraining />} />
            <Route path="/ear-training" element={<EarTraining />} />
            <Route path="/chord-training" element={<ChordTraining />} />
            <Route path="/statistics" element={<Statistics />} />
          </Routes>
        </div>
        <Navigation />
      </div>
    </Router>
  );
}
