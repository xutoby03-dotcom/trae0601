import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "@/pages/Layout";
import { UmbrellaList } from "@/pages/UmbrellaList";
import { UmbrellaRegister } from "@/pages/UmbrellaRegister";
import { AdminLogin } from "@/pages/admin/Login";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { ShareManagement } from "@/pages/admin/ShareManagement";
import { ScrapList } from "@/pages/admin/ScrapList";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><UmbrellaList /></Layout>} />
        <Route path="/register" element={<Layout><UmbrellaRegister /></Layout>} />
        <Route path="/admin/login" element={<Layout><AdminLogin /></Layout>} />
        <Route path="/admin" element={<Layout><AdminDashboard /></Layout>} />
        <Route path="/admin/share" element={<Layout><ShareManagement /></Layout>} />
        <Route path="/admin/scrap" element={<Layout><ScrapList /></Layout>} />
      </Routes>
    </Router>
  );
}
