import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import ScenePage from "@/pages/ScenePage";
import ExportPage from "@/pages/ExportPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/scenes" element={<ScenePage />} />
        <Route path="/export" element={<ExportPage />} />
      </Routes>
    </Router>
  );
}
