import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import ClothingRegister from "@/pages/ClothingRegister";
import TaskQueue from "@/pages/TaskQueue";
import TaskDetail from "@/pages/TaskDetail";
import MaterialManager from "@/pages/MaterialManager";
import CompletionRecords from "@/pages/CompletionRecords";
import useAppStore from "@/store/useAppStore";

function AppContent() {
  const initializeData = useAppStore((state) => state.initializeData);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/register" element={<ClothingRegister />} />
        <Route path="/queue" element={<TaskQueue />} />
        <Route path="/queue/:id" element={<TaskDetail />} />
        <Route path="/materials" element={<MaterialManager />} />
        <Route path="/records" element={<CompletionRecords />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
