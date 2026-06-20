import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LayoutReview from "@/pages/LayoutReview";
import HistoryLibrary from "@/pages/HistoryLibrary";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LayoutReview />} />
        <Route path="/history" element={<HistoryLibrary />} />
      </Routes>
    </Router>
  );
}
