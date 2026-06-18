import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import CageList from "@/pages/CageList";
import CageDetail from "@/pages/CageDetail";
import DailyTasks from "@/pages/DailyTasks";
import OperationRecords from "@/pages/OperationRecords";
import Statistics from "@/pages/Statistics";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/cages" element={<CageList />} />
          <Route path="/cages/:id" element={<CageDetail />} />
          <Route path="/tasks" element={<DailyTasks />} />
          <Route path="/records" element={<OperationRecords />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}
