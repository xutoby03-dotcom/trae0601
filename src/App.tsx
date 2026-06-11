import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Consumables from "@/pages/Consumables";
import Requisition from "@/pages/Requisition";
import Approval from "@/pages/Approval";
import Statistics from "@/pages/Statistics";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/consumables" element={<Consumables />} />
          <Route path="/request" element={<Requisition />} />
          <Route path="/approval" element={<Approval />} />
          <Route path="/statistics" element={<Statistics />} />
        </Route>
      </Routes>
    </Router>
  );
}
