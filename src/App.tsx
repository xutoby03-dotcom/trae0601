import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Elderly from "@/pages/Elderly";
import CheckIn from "@/pages/CheckIn";
import Exceptions from "@/pages/Exceptions";
import Report from "@/pages/Report";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/elderly" element={<Elderly />} />
          <Route path="/checkin" element={<CheckIn />} />
          <Route path="/exceptions" element={<Exceptions />} />
          <Route path="/report" element={<Report />} />
        </Route>
      </Routes>
    </Router>
  );
}
