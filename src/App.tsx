import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import BookDetail from "@/pages/BookDetail";
import Calendar from "@/pages/Calendar";
import Report from "@/pages/Report";
import BottomNav from "@/components/BottomNav";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-cream">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/book/:id" element={<BookDetail />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/report" element={<Report />} />
        </Routes>
        <BottomNav />
      </div>
    </Router>
  );
}
