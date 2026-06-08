import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import CreateGathering from "@/pages/CreateGathering";
import GatheringDetail from "@/pages/GatheringDetail";
import GatheringSummary from "@/pages/GatheringSummary";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gathering/new" element={<CreateGathering />} />
        <Route path="/gathering/:id" element={<GatheringDetail />} />
        <Route path="/gathering/:id/summary" element={<GatheringSummary />} />
      </Routes>
    </Router>
  );
}
