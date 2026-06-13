import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import PlantList from "@/pages/PlantList";
import PlantDetail from "@/pages/PlantDetail";
import PlantNew from "@/pages/PlantNew";
import PlantEdit from "@/pages/PlantEdit";
import ServiceRecord from "@/pages/ServiceRecord";
import IssueTrack from "@/pages/IssueTrack";
import Statistics from "@/pages/Statistics";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/plants" element={<PlantList />} />
          <Route path="/plants/new" element={<PlantNew />} />
          <Route path="/plants/:id" element={<PlantDetail />} />
          <Route path="/plants/:id/edit" element={<PlantEdit />} />
          <Route path="/service" element={<ServiceRecord />} />
          <Route path="/issues" element={<IssueTrack />} />
          <Route path="/stats" element={<Statistics />} />
        </Routes>
      </Layout>
    </Router>
  );
}
