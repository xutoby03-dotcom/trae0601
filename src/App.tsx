import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import EquipmentList from "@/pages/EquipmentList";
import EquipmentDetail from "@/pages/EquipmentDetail";
import BatchList from "@/pages/BatchList";
import NewBatch from "@/pages/NewBatch";
import InspectionList from "@/pages/InspectionList";
import NewInspection from "@/pages/NewInspection";
import Layout from "@/components/layout/Layout";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/equipment" element={<EquipmentList />} />
          <Route path="/equipment/:id" element={<EquipmentDetail />} />
          <Route path="/batches" element={<BatchList />} />
          <Route path="/batches/new" element={<NewBatch />} />
          <Route path="/inspections" element={<InspectionList />} />
          <Route path="/inspections/new" element={<NewInspection />} />
        </Route>
      </Routes>
    </Router>
  );
}
