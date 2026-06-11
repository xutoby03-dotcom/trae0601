import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ClothingArchive from "@/pages/ClothingArchive";
import WasherPage from "@/pages/WasherPage";
import HistoryPage from "@/pages/HistoryPage";
import SummaryPage from "@/pages/SummaryPage";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen font-sans">
        <Navbar />
        <main className="pb-16">
          <Routes>
            <Route path="/" element={<ClothingArchive />} />
            <Route path="/washer" element={<WasherPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/summary" element={<SummaryPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
