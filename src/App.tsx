import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import DashboardPage from "@/pages/Dashboard";
import ShelvesPage, { ShelfDetailPage } from "@/pages/Shelves";
import { PackagesPage, RegisterPage } from "@/pages/Packages";
import PickupPage from "@/pages/Pickup";
import ExceptionsPage from "@/pages/Exceptions";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/shelves" element={<ShelvesPage />} />
          <Route path="/shelves/:id" element={<ShelfDetailPage />} />
          <Route path="/packages" element={<PackagesPage />} />
          <Route path="/packages/register" element={<RegisterPage />} />
          <Route path="/pickup" element={<PickupPage />} />
          <Route path="/exceptions" element={<ExceptionsPage />} />
        </Route>
        <Route path="*" element={<div className="text-center p-10 text-slate-500">页面不存在</div>} />
      </Routes>
    </Router>
  );
}
