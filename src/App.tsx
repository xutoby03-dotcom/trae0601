import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Dashboard from "@/pages/Dashboard";
import BatchDetail from "@/pages/BatchDetail";
import AddBatch from "@/pages/AddBatch";
import Statistics from "@/pages/Statistics";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-cream-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/batch/:id" element={<BatchDetail />} />
          <Route path="/add" element={<AddBatch />} />
          <Route path="/statistics" element={<Statistics />} />
        </Routes>
      </div>
    </Router>
  );
}
