import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import EquipmentList from "@/pages/EquipmentList";
import EquipmentForm from "@/pages/EquipmentForm";
import TripList from "@/pages/TripList";
import PackingList from "@/pages/PackingList";
import ReturnCheck from "@/pages/ReturnCheck";
import DryingQueue from "@/pages/DryingQueue";
import Maintenance from "@/pages/Maintenance";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/equipment" element={<EquipmentList />} />
          <Route path="/equipment/new" element={<EquipmentForm />} />
          <Route path="/equipment/:id/edit" element={<EquipmentForm />} />
          <Route path="/trips" element={<TripList />} />
          <Route path="/trips/:id/pack" element={<PackingList />} />
          <Route path="/trips/:id/check" element={<ReturnCheck />} />
          <Route path="/drying" element={<DryingQueue />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route
            path="*"
            element={
              <div className="text-center py-20">
                <h2 className="font-serif text-2xl text-forest-800 mb-2">
                  404 - 页面不存在
                </h2>
                <p className="text-forest-600">请从侧边导航选择页面</p>
              </div>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}
