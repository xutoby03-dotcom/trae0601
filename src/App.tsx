import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import DashboardPage from "@/pages/DashboardPage";
import DeviceListPage from "@/pages/DeviceListPage";
import DeviceFormPage from "@/pages/DeviceFormPage";
import ReservationListPage from "@/pages/ReservationListPage";
import ReservationFormPage from "@/pages/ReservationFormPage";
import ReturnPage from "@/pages/ReturnPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/devices" element={<DeviceListPage />} />
          <Route path="/devices/new" element={<DeviceFormPage />} />
          <Route path="/devices/:id/edit" element={<DeviceFormPage />} />
          <Route path="/reservations" element={<ReservationListPage />} />
          <Route path="/reservations/new" element={<ReservationFormPage />} />
          <Route path="/returns" element={<ReturnPage />} />
          <Route path="*" element={
            <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
              <h2 className="text-5xl font-bold text-brand-600 mb-3">404</h2>
              <p className="text-zinc-600 mb-6">页面不存在或已被移动</p>
              <a href="/" className="btn-primary">返回首页</a>
            </div>
          } />
        </Route>
      </Routes>
    </Router>
  );
}
