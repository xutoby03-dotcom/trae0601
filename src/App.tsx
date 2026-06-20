import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import InspectionPage from "@/pages/InspectionPage";
import SamplesPage from "@/pages/SamplesPage";
import ReportPage from "@/pages/ReportPage";
import Header from "@/components/Header";

export default function App() {
  return (
    <Router>
      <div className="relative min-h-screen">
        <div className="relative z-10">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/inspection/:id" element={<InspectionPage />} />
            <Route path="/inspection/:id/samples" element={<SamplesPage />} />
            <Route path="/inspection/:id/report" element={<ReportPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
