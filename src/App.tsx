import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import DeviceList from "@/pages/DeviceList";
import DeviceDetail from "@/pages/DeviceDetail";
import DeviceForm from "@/pages/DeviceForm";
import PreCheck from "@/pages/PreCheck";
import PostRecord from "@/pages/PostRecord";
import Maintenance from "@/pages/Maintenance";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/devices" element={<DeviceList />} />
          <Route path="/devices/new" element={<DeviceForm />} />
          <Route path="/devices/:id" element={<DeviceDetail />} />
          <Route path="/devices/:id/edit" element={<DeviceForm />} />
          <Route path="/pre-check" element={<PreCheck />} />
          <Route path="/post-record" element={<PostRecord />} />
          <Route path="/maintenance" element={<Maintenance />} />
        </Route>
      </Routes>
    </Router>
  );
}
