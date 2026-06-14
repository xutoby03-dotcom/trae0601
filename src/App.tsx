import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import AddRecord from "@/pages/AddRecord";
import Stats from "@/pages/Stats";
import History from "@/pages/History";
import { Navbar } from "@/components/Navbar";

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<AddRecord />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </Router>
  );
}
