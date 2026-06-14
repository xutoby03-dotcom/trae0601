import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import EquipmentList from "@/pages/EquipmentList";
import EquipmentDetail from "@/pages/EquipmentDetail";
import EquipmentForm from "@/pages/EquipmentForm";
import UsageList from "@/pages/UsageList";
import UsageForm from "@/pages/UsageForm";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/equipment" element={<EquipmentList />} />
          <Route path="/equipment/new" element={<EquipmentForm />} />
          <Route path="/equipment/:id" element={<EquipmentDetail />} />
          <Route path="/equipment/:id/edit" element={<EquipmentForm />} />
          <Route path="/usage" element={<UsageList />} />
          <Route path="/usage/new" element={<UsageForm />} />
        </Routes>
      </Layout>
    </Router>
  );
}
