import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Home from "@/pages/Home";
import BookingPage from "@/pages/BookingPage";
import FaultsPage from "@/pages/FaultsPage";
import StatsPage from "@/pages/StatsPage";
import RoomsManage from "@/pages/RoomsManage";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Navbar />
        <main className="pb-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/faults" element={<FaultsPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/rooms-manage" element={<RoomsManage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
