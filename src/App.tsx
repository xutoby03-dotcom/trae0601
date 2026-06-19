import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import AreaList from "@/pages/Areas/AreaList";
import AreaForm from "@/pages/Areas/AreaForm";
import InspectionList from "@/pages/Inspections/InspectionList";
import InspectionForm from "@/pages/Inspections/InspectionForm";
import TaskList from "@/pages/Tasks/TaskList";
import TaskForm from "@/pages/Tasks/TaskForm";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/areas" element={<AreaList />} />
          <Route path="/areas/new" element={<AreaForm />} />
          <Route path="/areas/:id" element={<AreaForm />} />
          <Route path="/inspections" element={<InspectionList />} />
          <Route path="/inspections/:areaId" element={<InspectionForm />} />
          <Route path="/tasks" element={<TaskList />} />
          <Route path="/tasks/new" element={<TaskForm />} />
          <Route path="/tasks/:id" element={<TaskForm />} />
        </Route>
      </Routes>
    </Router>
  );
}
