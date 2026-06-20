import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { ElderList } from "./pages/ElderList";
import { ElderDetail } from "./pages/ElderDetail";
import { ElderForm } from "./pages/ElderForm";
import { AppointmentList } from "./pages/AppointmentList";
import { AppointmentForm } from "./pages/AppointmentForm";
import { AppointmentDetail } from "./pages/AppointmentDetail";
import { DepartureConfirm } from "./pages/DepartureConfirm";
import { ServiceComplete } from "./pages/ServiceComplete";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/elders" element={<ElderList />} />
          <Route path="/elders/new" element={<ElderForm mode="create" />} />
          <Route path="/elders/:id" element={<ElderDetail />} />
          <Route path="/elders/:id/edit" element={<ElderForm mode="edit" />} />
          <Route path="/appointments" element={<AppointmentList />} />
          <Route path="/appointments/new" element={<AppointmentForm />} />
          <Route path="/appointments/:id" element={<AppointmentDetail />} />
          <Route
            path="/appointments/:id/confirm-departure"
            element={<DepartureConfirm />}
          />
          <Route
            path="/appointments/:id/complete"
            element={<ServiceComplete />}
          />
        </Route>
      </Routes>
    </Router>
  );
}
