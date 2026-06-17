import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import TimelinePage from "@/pages/TimelinePage";
import MembersPage from "@/pages/MembersPage";
import ItemsPage from "@/pages/ItemsPage";
import MonitorPage from "@/pages/MonitorPage";
import WorkloadPage from "@/pages/WorkloadPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<TimelinePage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/items" element={<ItemsPage />} />
          <Route path="/monitor" element={<MonitorPage />} />
          <Route path="/workload" element={<WorkloadPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
