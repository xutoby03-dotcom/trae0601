import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Cats from "@/pages/Cats";
import LitterBoxes from "@/pages/LitterBoxes";
import CleaningRecords from "@/pages/CleaningRecords";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/cats" element={<Cats />} />
          <Route path="/litter-boxes" element={<LitterBoxes />} />
          <Route path="/cleaning-records" element={<CleaningRecords />} />
        </Route>
      </Routes>
    </Router>
  );
}
