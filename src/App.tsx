import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Dashboard } from "@/pages/Dashboard";
import { CabinetDetail } from "@/pages/CabinetDetail";
import { PurchaseList } from "@/pages/PurchaseList";
import { Statistics } from "@/pages/Statistics";
import { useAppInit } from "@/hooks/useAppInit";

function AppContent() {
  useAppInit();
  
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="cabinet/:id" element={<CabinetDetail />} />
        <Route path="purchase" element={<PurchaseList />} />
        <Route path="statistics" element={<Statistics />} />
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
