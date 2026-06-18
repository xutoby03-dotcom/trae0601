import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Home from "@/pages/Home";
import DeviceProfile from "@/pages/DeviceProfile";
import Measurements from "@/pages/Measurements";
import Trends from "@/pages/Trends";
import Export from "@/pages/Export";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navbar />
        <main className="pt-20 pb-24 md:pb-8 px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/device" element={<DeviceProfile />} />
            <Route path="/records" element={<Measurements />} />
            <Route path="/trends" element={<Trends />} />
            <Route path="/export" element={<Export />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
