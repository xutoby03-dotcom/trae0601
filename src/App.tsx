import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout.js";
import Dashboard from "@/pages/Dashboard.js";
import MoldList from "@/pages/MoldList.js";
import MoldDetail from "@/pages/MoldDetail.js";
import MoldForm from "@/pages/MoldForm.js";
import BorrowList from "@/pages/BorrowList.js";
import BorrowForm from "@/pages/BorrowForm.js";
import ReturnForm from "@/pages/ReturnForm.js";
import ExceptionList from "@/pages/ExceptionList.js";
import ExceptionForm from "@/pages/ExceptionForm.js";
import MasterList from "@/pages/MasterList.js";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="molds" element={<MoldList />} />
          <Route path="molds/new" element={<MoldForm />} />
          <Route path="molds/:id" element={<MoldDetail />} />
          <Route path="molds/:id/edit" element={<MoldForm />} />
          <Route path="borrow" element={<BorrowList />} />
          <Route path="borrow/new" element={<BorrowForm />} />
          <Route path="return/:id" element={<ReturnForm />} />
          <Route path="exception" element={<ExceptionList />} />
          <Route path="exception/:id" element={<ExceptionForm />} />
          <Route path="masters" element={<MasterList />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}
