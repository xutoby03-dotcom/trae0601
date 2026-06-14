import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import CostumeList from "@/pages/CostumeList";
import CostumeDetail from "@/pages/CostumeDetail";
import CostumeForm from "@/pages/CostumeForm";
import BorrowForm from "@/pages/BorrowForm";
import BorrowRecords from "@/pages/BorrowRecords";
import ReturnCheck from "@/pages/ReturnCheck";
import Statistics from "@/pages/Statistics";
import Notifications from "@/pages/Notifications";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/costumes" element={<CostumeList />} />
          <Route path="/costumes/new" element={<CostumeForm />} />
          <Route path="/costumes/:id" element={<CostumeDetail />} />
          <Route path="/costumes/:id/edit" element={<CostumeForm />} />
          <Route path="/borrow" element={<BorrowForm />} />
          <Route path="/borrow/records" element={<BorrowRecords />} />
          <Route path="/return" element={<ReturnCheck />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
      </Layout>
    </Router>
  );
}
