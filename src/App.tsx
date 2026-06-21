import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from '@/components/Header';
import { FabricList } from '@/pages/FabricList';
import { FabricDetail } from '@/pages/FabricDetail';
import { FabricEditor } from '@/pages/FabricEditor';
import { BoardList } from '@/pages/BoardList';
import { BoardDetail } from '@/pages/BoardDetail';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#F8F4ED]">
        <Header />
        <Routes>
          <Route path="/" element={<FabricList />} />
          <Route path="/fabric/:id" element={<FabricDetail />} />
          <Route path="/fabric/:id/edit" element={<FabricEditor />} />
          <Route path="/fabric/new" element={<FabricEditor />} />
          <Route path="/boards" element={<BoardList />} />
          <Route path="/board/:id" element={<BoardDetail />} />
        </Routes>
      </div>
    </Router>
  );
}
