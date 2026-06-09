import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Home from "@/pages/Home";
import Register from "@/pages/Register";
import Project from "@/pages/Project";
import Materials from "@/pages/Materials";
import Stats from "@/pages/Stats";

export default function App() {
  return (
    <Router>
      <Navbar />
      <main className="md:pt-16 pb-20 md:pb-8 min-h-screen bg-cream-100">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/project/:id" element={<Project />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/stats" element={<Stats />} />
        </Routes>
      </main>
    </Router>
  );
}
