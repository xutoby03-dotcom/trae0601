import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CalibrationPage from "@/pages/CalibrationPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CalibrationPage />} />
      </Routes>
    </Router>
  );
}
