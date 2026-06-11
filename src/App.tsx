import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Home from '@/pages/Home';
import MedicineList from '@/pages/MedicineList';
import MedicineDetail from '@/pages/MedicineDetail';
import MedicineForm from '@/pages/MedicineForm';
import PendingList from '@/pages/PendingList';
import Statistics from '@/pages/Statistics';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/medicines" element={<MedicineList />} />
            <Route path="/medicines/new" element={<MedicineForm />} />
            <Route path="/medicines/:id" element={<MedicineDetail />} />
            <Route path="/medicines/:id/edit" element={<MedicineForm />} />
            <Route path="/pending" element={<PendingList />} />
            <Route path="/statistics" element={<Statistics />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
