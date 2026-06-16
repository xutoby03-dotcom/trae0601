import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PlantListPage from "@/pages/PlantListPage";
import PlantDetailPage from "@/pages/PlantDetailPage";
import RepotPage from "@/pages/RepotPage";
import CreatePlantPage from "@/pages/CreatePlantPage";
import MonthlyViewPage from "@/pages/MonthlyViewPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<PlantListPage />} />
          <Route path="/plants" element={<PlantListPage />} />
          <Route path="/plants/create" element={<CreatePlantPage />} />
          <Route path="/plants/:id" element={<PlantDetailPage />} />
          <Route path="/plants/:id/repot" element={<RepotPage />} />
          <Route path="/monthly" element={<MonthlyViewPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
