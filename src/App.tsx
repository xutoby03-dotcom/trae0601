import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import TaskPool from "@/pages/TaskPool";
import TaskDetail from "@/pages/TaskDetail";
import Stats from "@/pages/Stats";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/pool" element={<TaskPool />} />
          <Route path="/task/:taskId" element={<TaskDetail />} />
          <Route path="/stats" element={<Stats />} />
        </Route>
      </Routes>
    </Router>
  );
}
