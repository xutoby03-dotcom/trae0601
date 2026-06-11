import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Publish from "@/pages/Publish";
import TastingDetail from "@/pages/TastingDetail";
import Feedback from "@/pages/Feedback";
import Stats from "@/pages/Stats";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/publish" element={<Publish />} />
        <Route path="/tasting/:id" element={<TastingDetail />} />
        <Route path="/feedback/:id" element={<Feedback />} />
        <Route path="/stats" element={<Stats />} />
      </Routes>
    </Router>
  );
}
