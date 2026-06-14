import { useEffect } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import BasketList from "@/pages/BasketList";
import BasketForm from "@/pages/BasketForm";
import LendForm from "@/pages/LendForm";
import ReturnCheck from "@/pages/ReturnCheck";
import Statistics from "@/pages/Statistics";
import { useStore } from "@/store/useStore";

function AppRoutes() {
  const refreshOverdue = useStore((s) => s.refreshOverdueStatus);

  useEffect(() => {
    refreshOverdue();
    const t = setInterval(refreshOverdue, 60000);
    return () => clearInterval(t);
  }, [refreshOverdue]);

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/baskets" element={<BasketList />} />
        <Route path="/baskets/new" element={<BasketForm />} />
        <Route path="/baskets/:id/edit" element={<BasketForm />} />
        <Route path="/lend" element={<LendForm />} />
        <Route path="/return" element={<ReturnCheck />} />
        <Route path="/stats" element={<Statistics />} />
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </AppLayout>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
