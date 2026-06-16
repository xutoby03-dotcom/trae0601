import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Vehicles from "./pages/Vehicles";
import Itinerary from "./pages/Itinerary";
import Allocation from "./pages/Allocation";
import Records from "./pages/Records";
import Settlement from "./pages/Settlement";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/itinerary" element={<Itinerary />} />
        <Route path="/allocation" element={<Allocation />} />
        <Route path="/records" element={<Records />} />
        <Route path="/settlement" element={<Settlement />} />
      </Routes>
    </Router>
  );
}
