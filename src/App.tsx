import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Dashboard } from "@/pages/Dashboard";
import { ModelDetail } from "@/pages/ModelDetail";
import { ShelfZone } from "@/pages/ShelfZone";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-studio-bg">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/model/:id" element={<ModelDetail />} />
          <Route path="/shelf" element={<ShelfZone />} />
        </Routes>
      </div>
    </Router>
  );
}
