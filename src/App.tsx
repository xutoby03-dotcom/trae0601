import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import PitcherList from "@/pages/PitcherList";
import PitcherDetail from "@/pages/PitcherDetail";
import PitcherForm from "@/pages/PitcherForm";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/pitchers" element={<PitcherList />} />
        <Route path="/pitchers/new" element={<PitcherForm />} />
        <Route path="/pitchers/:id" element={<PitcherDetail />} />
        <Route path="/pitchers/:id/edit" element={<PitcherForm />} />
      </Routes>
    </Router>
  );
}
