import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import Test from '@/pages/Test';
import Result from '@/pages/Result';
import Detail from '@/pages/Detail';
import History from '@/pages/History';
import Navbar from '@/components/Navbar';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-mbti-dark">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/test" element={<Test />} />
          <Route path="/result" element={<Result />} />
          <Route path="/detail/:type" element={<Detail />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </div>
    </Router>
  );
}
