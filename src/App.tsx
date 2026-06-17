import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import MotherStarters from "@/pages/MotherStarters";
import StarterForm from "@/pages/StarterForm";
import StarterDetail from "@/pages/StarterDetail";
import FeedingPage from "@/pages/FeedingPage";
import ProductionPage from "@/pages/ProductionPage";
import AnomalyPage from "@/pages/AnomalyPage";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/starters" element={<MotherStarters />} />
          <Route path="/starters/new" element={<StarterForm />} />
          <Route path="/starters/:id/edit" element={<StarterForm />} />
          <Route path="/starters/:id" element={<StarterDetail />} />
          <Route path="/feeding" element={<FeedingPage />} />
          <Route path="/production" element={<ProductionPage />} />
          <Route path="/anomalies" element={<AnomalyPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}
