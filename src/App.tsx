import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RoleSelect from "@/pages/RoleSelect";
import ResidentHome from "@/pages/resident/ResidentHome";
import BookingPage from "@/pages/resident/BookingPage";
import UsingPage from "@/pages/resident/UsingPage";
import CleanerDashboard from "@/pages/cleaner/CleanerDashboard";
import AdminDashboard from "@/pages/admin/AdminDashboard";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<RoleSelect />} />
          <Route path="/resident" element={<ResidentHome />} />
          <Route path="/resident/booking" element={<BookingPage />} />
          <Route path="/resident/using/:bookingId" element={<UsingPage />} />
          <Route path="/cleaner" element={<CleanerDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}
