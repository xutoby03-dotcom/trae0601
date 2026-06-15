import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import StudentList from "@/pages/StudentList";
import StudentForm from "@/pages/StudentForm";
import MenuManage from "@/pages/MenuManage";
import KitchenPrep from "@/pages/KitchenPrep";
import PickupRegister from "@/pages/PickupRegister";
import Statistics from "@/pages/Statistics";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="students" element={<StudentList />} />
          <Route path="students/new" element={<StudentForm />} />
          <Route path="students/:id" element={<StudentForm />} />
          <Route path="menu" element={<MenuManage />} />
          <Route path="prep" element={<KitchenPrep />} />
          <Route path="pickup" element={<PickupRegister />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}
