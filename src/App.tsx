import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import PetProfile from "@/pages/PetProfile";
import TaskList from "@/pages/TaskList";
import TaskDetail from "@/pages/TaskDetail";
import Report from "@/pages/Report";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<PetProfile />} />
          <Route path="/tasks" element={<TaskList />} />
          <Route path="/tasks/:id" element={<TaskDetail />} />
          <Route path="/report/:id" element={<Report />} />
        </Routes>
      </Layout>
    </Router>
  );
}
