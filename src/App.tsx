import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import AddCamp from "@/pages/AddCamp";
import CampDetail from "@/pages/CampDetail";
import RecordExperience from "@/pages/RecordExperience";
import Stats from "@/pages/Stats";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/camp/add" element={<AddCamp />} />
        <Route path="/camp/:id" element={<CampDetail />} />
        <Route path="/camp/:id/edit" element={<AddCamp />} />
        <Route path="/camp/:id/experience" element={<RecordExperience />} />
        <Route path="/stats" element={<Stats />} />
      </Routes>
    </Router>
  );
}
