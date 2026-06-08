import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Pets from "@/pages/Pets";
import Schedule from "@/pages/Schedule";
import PetDetail from "@/pages/PetDetail";
import Stats from "@/pages/Stats";
import Foster from "@/pages/Foster";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Pets />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/pet/:id" element={<PetDetail />} />
          <Route path="/stats" element={<Stats />} />
        </Route>
        <Route path="/foster/:token" element={<Foster />} />
      </Routes>
    </Router>
  );
}
