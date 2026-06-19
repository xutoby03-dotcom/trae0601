import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import QueuePage from "@/pages/QueuePage";
import RoomsPage from "@/pages/RoomsPage";
import RecordsPage from "@/pages/RecordsPage";
import StatsPage from "@/pages/StatsPage";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/queue" element={<QueuePage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/records" element={<RecordsPage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}
