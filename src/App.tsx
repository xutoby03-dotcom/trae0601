import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { Inspection } from './pages/Inspection';
import { Tasks } from './pages/Tasks';
import { CleaningRecords } from './pages/CleaningRecords';
import { Procurement } from './pages/Procurement';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50/30">
        <Navbar />
        <main className="pb-12">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inspection/:bathroomId" element={<Inspection />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/cleaning-records" element={<CleaningRecords />} />
            <Route path="/procurement" element={<Procurement />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
