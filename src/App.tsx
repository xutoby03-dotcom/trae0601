import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import AreaList from "@/pages/AreaList";
import VehicleList from "@/pages/VehicleList";
import PatrolList from "@/pages/PatrolList";
import DisposalList from "@/pages/DisposalList";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/areas" element={<AreaList />} />
          <Route path="/vehicles" element={<VehicleList />} />
          <Route path="/patrols" element={<PatrolList />} />
          <Route path="/disposals" element={<DisposalList />} />
          <Route path="*" element={<div className="text-center py-20 text-slate-500">页面不存在</div>} />
        </Routes>
      </Layout>
    </Router>
  );
}
