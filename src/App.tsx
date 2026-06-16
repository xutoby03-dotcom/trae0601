import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/common/AppLayout";
import Dashboard from "@/pages/Dashboard";
import AquariumList from "@/pages/AquariumList";
import AquariumDetail from "@/pages/AquariumDetail";
import AquariumForm from "@/components/aquarium/AquariumForm";
import FeedingRecord from "@/pages/FeedingRecord";
import WaterRecord from "@/pages/WaterRecord";
import Statistics from "@/pages/Statistics";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/aquariums" element={<AquariumList />} />
          <Route path="/aquariums/new" element={<AquariumForm />} />
          <Route path="/aquariums/:id" element={<AquariumDetail />} />
          <Route path="/feeding" element={<FeedingRecord />} />
          <Route path="/water" element={<WaterRecord />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="*" element={<Dashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}
