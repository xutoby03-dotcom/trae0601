import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "@/pages/dashboard/Dashboard";
import ScoresPage from "@/pages/scores";
import MembersPage from "@/pages/members";
import BorrowPage from "@/pages/borrow";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/scores" element={<ScoresPage />} />
        <Route path="/scores/:id" element={<ScoresPage />} />
        <Route path="/members" element={<MembersPage />} />
        <Route path="/members/:id" element={<MembersPage />} />
        <Route path="/borrow" element={<BorrowPage />} />
      </Routes>
    </Router>
  );
}
