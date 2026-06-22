import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CheckpointLayout from "@/pages/CheckpointLayout";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CheckpointLayout />} />
      </Routes>
    </Router>
  );
}
