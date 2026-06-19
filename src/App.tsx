import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/Layout/AppLayout";
import { Dashboard } from "./pages/Dashboard";
import { BoxList } from "./pages/BoxList";
import { BoxDetail } from "./pages/BoxDetail";
import { BoxForm } from "./pages/BoxForm";
import { CleaningList } from "./pages/CleaningList";
import { CleaningForm } from "./pages/CleaningForm";
import { MaintenanceList } from "./pages/MaintenanceList";
import { MaintenanceForm } from "./pages/MaintenanceForm";
import { OrderAssignment } from "./pages/OrderAssignment";
import { Statistics } from "./pages/Statistics";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="boxes" element={<BoxList />} />
          <Route path="boxes/new" element={<BoxForm />} />
          <Route path="boxes/:id" element={<BoxDetail />} />
          <Route path="boxes/:id/edit" element={<BoxForm />} />
          <Route path="cleaning" element={<CleaningList />} />
          <Route path="cleaning/:boxId" element={<CleaningForm />} />
          <Route path="maintenance" element={<MaintenanceList />} />
          <Route path="maintenance/new" element={<MaintenanceForm />} />
          <Route path="maintenance/:id/edit" element={<MaintenanceForm />} />
          <Route path="assignment" element={<OrderAssignment />} />
          <Route path="statistics" element={<Statistics />} />
        </Route>
      </Routes>
    </Router>
  );
}
