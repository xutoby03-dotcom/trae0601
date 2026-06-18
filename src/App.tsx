import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import DeviceList from "@/pages/DeviceList";
import DeviceForm from "@/pages/DeviceForm";
import DeviceDetail from "@/pages/DeviceDetail";
import Checklist from "@/pages/Checklist";
import IncidentList from "@/pages/IncidentList";
import IncidentForm from "@/pages/IncidentForm";
import RepairTasks from "@/pages/RepairTasks";
import QuickCard from "@/pages/QuickCard";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="devices" element={<DeviceList />} />
          <Route path="devices/new" element={<DeviceForm />} />
          <Route path="devices/:id" element={<DeviceDetail />} />
          <Route path="devices/:id/edit" element={<DeviceForm />} />
          <Route path="checklist" element={<Checklist />} />
          <Route path="incidents" element={<IncidentList />} />
          <Route path="incidents/new" element={<IncidentForm />} />
          <Route path="repairs" element={<RepairTasks />} />
          <Route path="quick-card" element={<QuickCard />} />
        </Route>
      </Routes>
    </Router>
  );
}
