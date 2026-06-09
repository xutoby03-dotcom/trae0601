import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import AddAC from "@/pages/AddAC";
import ACDetail from "@/pages/ACDetail";
import AddRecord from "@/pages/AddRecord";
import Stats from "@/pages/Stats";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<AddAC />} />
        <Route path="/ac/:id" element={<ACDetail />} />
        <Route path="/ac/:id/record" element={<AddRecord />} />
        <Route path="/stats" element={<Stats />} />
      </Routes>
    </Router>
  );
}
