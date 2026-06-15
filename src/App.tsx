import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Reservation from "./pages/Reservation";
import Elevators from "./pages/Elevators";
import Dashboard from "./pages/Dashboard";
import Completion from "./pages/Completion";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/reservation" replace />} />
          <Route path="reservation" element={<Reservation />} />
          <Route path="elevators" element={<Elevators />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="completion" element={<Completion />} />
        </Route>
      </Routes>
    </Router>
  );
}
