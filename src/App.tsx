import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Marketplace from "@/pages/Marketplace";
import Publish from "@/pages/Publish";
import ItemDetail from "@/pages/ItemDetail";
import Stats from "@/pages/Stats";

export default function App() {
  return (
    <Router>
      <Navbar />
      <div className="pt-14 min-h-screen bg-carbon-50">
        <Routes>
          <Route path="/" element={<Marketplace />} />
          <Route path="/publish" element={<Publish />} />
          <Route path="/item/:id" element={<ItemDetail />} />
          <Route path="/stats" element={<Stats />} />
        </Routes>
      </div>
    </Router>
  );
}
