import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import PackageRegister from "@/pages/PackageRegister";
import Pickup from "@/pages/Pickup";
import LockerManager from "@/pages/LockerManager";
import Statistics from "@/pages/Statistics";
import { ToastProvider } from "@/context/ToastContext";

export default function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/register" element={<PackageRegister />} />
            <Route path="/pickup" element={<Pickup />} />
            <Route path="/lockers" element={<LockerManager />} />
            <Route path="/stats" element={<Statistics />} />
          </Route>
        </Routes>
      </Router>
    </ToastProvider>
  );
}
