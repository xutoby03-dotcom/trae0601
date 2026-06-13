import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Beds from "@/pages/Beds";
import Reservations from "@/pages/Reservations";
import CheckIn from "@/pages/CheckIn";
import Statistics from "@/pages/Statistics";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/beds" element={<Beds />} />
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/check-in" element={<CheckIn />} />
          <Route path="/statistics" element={<Statistics />} />
        </Routes>
      </Layout>
    </Router>
  );
}
