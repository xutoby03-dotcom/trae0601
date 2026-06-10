import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Home from "@/pages/Home";
import CreateTeam from "@/pages/CreateTeam";
import TeamDetail from "@/pages/TeamDetail";
import ReviewTeam from "@/pages/ReviewTeam";
import Stats from "@/pages/Stats";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateTeam />} />
            <Route path="/team/:id" element={<TeamDetail />} />
            <Route path="/team/:id/review" element={<ReviewTeam />} />
            <Route path="/stats" element={<Stats />} />
          </Routes>
        </main>
        <footer className="py-8 border-t border-gold-600/10 mt-10">
          <div className="container mx-auto px-4 text-center">
            <p className="text-midnight-500 font-serif text-sm">
              🔐 密境集结 · 密室逃脱组队平台
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}
