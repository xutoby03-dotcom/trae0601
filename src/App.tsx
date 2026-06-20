import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import DashboardPage from "@/pages/DashboardPage";
import HeadsetsPage from "@/pages/HeadsetsPage";
import HeadsetForm from "@/components/HeadsetForm";
import BorrowPage from "@/pages/BorrowPage";
import ReturnPage from "@/pages/ReturnPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="headsets" element={<HeadsetsPage />} />
          <Route path="headsets/new" element={<HeadsetForm mode="create" />} />
          <Route path="headsets/:id/edit" element={<HeadsetForm mode="edit" />} />
          <Route path="borrow" element={<BorrowPage />} />
          <Route path="return" element={<ReturnPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
