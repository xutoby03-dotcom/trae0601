import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GameSetup from "@/pages/GameSetup";
import ScoreTable from "@/pages/ScoreTable";
import History from "@/pages/History";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GameSetup />} />
        <Route path="/game/:id" element={<ScoreTable />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </Router>
  );
}
