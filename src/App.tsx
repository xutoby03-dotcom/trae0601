import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Home from "@/pages/Home";
import MedicineList from "@/pages/MedicineList";
import MedicineForm from "@/pages/MedicineForm";
import MedicineDetail from "@/pages/MedicineDetail";
import Records from "@/pages/Records";
import RecordForm from "@/pages/RecordForm";
import Layout from "@/components/Layout";
import { useMedicineStore } from "@/store/medicineStore";

function AppContent() {
  const { loadFromStorage } = useMedicineStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/medicines" element={<MedicineList />} />
        <Route path="/medicines/add" element={<MedicineForm />} />
        <Route path="/medicines/:id" element={<MedicineDetail />} />
        <Route path="/medicines/:id/edit" element={<MedicineForm />} />
        <Route path="/records" element={<Records />} />
        <Route path="/records/add" element={<RecordForm />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
