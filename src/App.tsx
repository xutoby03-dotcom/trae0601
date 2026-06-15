import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import Home from "@/pages/Home";
import FoodDetail from "@/pages/FoodDetail";
import PublishFood from "@/pages/PublishFood";
import Stats from "@/pages/Stats";
import Records from "@/pages/Records";
import MyClaims from "@/pages/MyClaims";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-warm-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/food/:id" element={<FoodDetail />} />
          <Route path="/admin/publish" element={<PublishFood />} />
          <Route path="/admin/stats" element={<Stats />} />
          <Route path="/admin/records" element={<Records />} />
          <Route path="/my/claims" element={<MyClaims />} />
        </Routes>
      </div>
    </Router>
  );
}
