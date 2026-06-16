import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import CabinetOverview from "@/pages/CabinetOverview";
import BorrowPage from "@/pages/BorrowPage";
import ReturnPage from "@/pages/ReturnPage";
import DonatePage from "@/pages/DonatePage";
import TeacherView from "@/pages/TeacherView";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminReview from "@/pages/AdminReview";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<CabinetOverview />} />
          <Route path="/borrow/:bookId" element={<BorrowPage />} />
          <Route path="/return" element={<ReturnPage />} />
          <Route path="/donate" element={<DonatePage />} />
          <Route path="/teacher" element={<TeacherView />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/review" element={<AdminReview />} />
        </Route>
      </Routes>
    </Router>
  );
}
