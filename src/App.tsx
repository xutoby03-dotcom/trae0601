import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import DeviceList from "@/pages/DeviceList";
import DeviceDetail from "@/pages/DeviceDetail";
import DeviceNew from "@/pages/DeviceNew";
import LoanList from "@/pages/LoanList";
import LoanDetail from "@/pages/LoanDetail";
import LoanNew from "@/pages/LoanNew";
import ReturnCheck from "@/pages/ReturnCheck";
import RenewalList from "@/pages/RenewalList";
import ExceptionList from "@/pages/ExceptionList";
import Statistics from "@/pages/Statistics";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/devices" element={<DeviceList />} />
        <Route path="/devices/new" element={<DeviceNew />} />
        <Route path="/devices/:id" element={<DeviceDetail />} />
        <Route path="/loans" element={<LoanList />} />
        <Route path="/loans/new" element={<LoanNew />} />
        <Route path="/loans/:id" element={<LoanDetail />} />
        <Route path="/loans/:id/return" element={<ReturnCheck />} />
        <Route path="/renewals" element={<RenewalList />} />
        <Route path="/exceptions" element={<ExceptionList />} />
        <Route path="/statistics" element={<Statistics />} />
      </Routes>
    </Router>
  );
}
