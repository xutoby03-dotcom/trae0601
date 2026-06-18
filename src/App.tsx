import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Home from "@/pages/Home";
import Booking from "@/pages/Booking";
import MyBookings from "@/pages/MyBookings";
import CheckIn from "@/pages/CheckIn";
import Return from "@/pages/Return";
import AdminLogin from "@/pages/AdminLogin";
import AdminLayout from "@/components/layout/AdminLayout";
import Dashboard from "@/pages/admin/Dashboard";
import NoShows from "@/pages/admin/NoShows";
import Damages from "@/pages/admin/Damages";
import Tables from "@/pages/admin/Tables";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { useAppStore } from "@/store";

export default function App() {
  const { initData, refreshData } = useAppStore();

  useEffect(() => {
    initData();
    const timer = setInterval(refreshData, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/checkin/:bookingId" element={<CheckIn />} />
        <Route path="/return/:bookingId" element={<Return />} />
        <Route path="/admin" element={<AdminLogin />} />
        
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="no-shows" element={<NoShows />} />
          <Route path="damages" element={<Damages />} />
          <Route path="tables" element={<Tables />} />
        </Route>

        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}
