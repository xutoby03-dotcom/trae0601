import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Students from "@/pages/Students";
import Products from "@/pages/Products";
import Orders from "@/pages/Orders";
import Purchases from "@/pages/Purchases";
import { useAppStore } from "@/store/appStore";

export default function App() {
  const fetchAll = useAppStore((state) => state.fetchAll);
  const loading = useAppStore((state) => state.loading);
  const error = useAppStore((state) => state.error);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const isLoading =
    loading.students || loading.products || loading.orders || loading.purchases;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout loading={isLoading} error={error} />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="purchases" element={<Purchases />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}
