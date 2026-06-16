import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout, ProtectedRoute } from "@/components/layout";
import { Toast } from "@/components/ui";
import {
  Login,
  Dashboard,
  FurnitureList,
  FurnitureDetail,
  FurnitureNew,
  OpenBooth,
  CloseBooth,
  Reminders,
  ReminderSettings,
  Incidents,
  IncidentDetail,
  IncidentNew,
  Statistics,
} from "@/pages";

export default function App() {
  return (
    <Router>
      <Toast />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="furniture" element={<FurnitureList />} />
          <Route path="furniture/new" element={<FurnitureNew />} />
          <Route path="furniture/:id" element={<FurnitureDetail />} />
          <Route path="furniture/:id/edit" element={<FurnitureNew />} />
          <Route path="open" element={<OpenBooth />} />
          <Route path="close" element={<CloseBooth />} />
          <Route path="reminders" element={<Reminders />} />
          <Route path="reminders/settings" element={<ReminderSettings />} />
          <Route path="incidents" element={<Incidents />} />
          <Route path="incidents/new" element={<IncidentNew />} />
          <Route path="incidents/:id" element={<IncidentDetail />} />
          <Route path="statistics" element={<Statistics />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
