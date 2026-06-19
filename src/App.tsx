import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import StudentList from "@/pages/StudentList";
import StudentForm from "@/pages/StudentForm";
import InventoryList from "@/pages/InventoryList";
import DistributeCenter from "@/pages/DistributeCenter";
import RecordsCenter from "@/pages/RecordsCenter";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/students" element={<StudentList />} />
          <Route path="/students/new" element={<StudentForm />} />
          <Route path="/students/:id" element={<StudentForm />} />
          <Route path="/inventory" element={<InventoryList />} />
          <Route path="/inventory/:category" element={<InventoryList />} />
          <Route path="/distribute" element={<DistributeCenter />} />
          <Route path="/records" element={<RecordsCenter />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}
