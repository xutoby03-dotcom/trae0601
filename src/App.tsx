import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import TodoListPage from "@/pages/TodoListPage";
import MeetingListPage from "@/pages/MeetingListPage";
import MeetingDetailPage from "@/pages/MeetingDetailPage";
import TodoDetailPage from "@/pages/TodoDetailPage";
import DashboardPage from "@/pages/DashboardPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<TodoListPage />} />
          <Route path="/meetings" element={<MeetingListPage />} />
          <Route path="/meetings/:id" element={<MeetingDetailPage />} />
          <Route path="/todos/:id" element={<TodoDetailPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}
