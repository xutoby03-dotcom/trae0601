import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import AddPhone from "@/pages/AddPhone";
import PhoneDetail from "@/pages/PhoneDetail";
import Stats from "@/pages/Stats";
import BottomNav from "@/components/BottomNav";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add" element={<AddPhone />} />
          <Route path="/phone/:id" element={<PhoneDetail />} />
          <Route path="/phone/:id/edit" element={<AddPhone />} />
          <Route path="/stats" element={<Stats />} />
        </Routes>
        <BottomNav />
      </div>
    </Router>
  );
}
