import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import Dashboard from '@/pages/Dashboard';
import ChildrenList from '@/pages/ChildrenList';
import ChildDetail from '@/pages/ChildDetail';
import ChildEdit from '@/pages/ChildEdit';
import VaccineList from '@/pages/VaccineList';
import Statistics from '@/pages/Statistics';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex">
        <Sidebar />
        <main className="flex-1 min-w-0 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/children" element={<ChildrenList />} />
              <Route path="/children/new" element={<ChildEdit />} />
              <Route path="/children/:id" element={<ChildDetail />} />
              <Route path="/children/:id/edit" element={<ChildEdit />} />
              <Route path="/vaccines" element={<VaccineList />} />
              <Route path="/statistics" element={<Statistics />} />
              <Route
                path="*"
                element={
                  <div className="text-center py-24">
                    <h1 className="font-display text-3xl text-slate-800 mb-2">404</h1>
                    <p className="text-slate-500">页面不存在</p>
                  </div>
                }
              />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}
