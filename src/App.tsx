import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Printers from "@/pages/Printers";
import Consumptions from "@/pages/Consumptions";
import Replenishments from "@/pages/Replenishments";
import Alerts from "@/pages/Alerts";
import Statistics from "@/pages/Statistics";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/printers" element={<Printers />} />
          <Route path="/consumptions" element={<Consumptions />} />
          <Route path="/replenishments" element={<Replenishments />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/statistics" element={<Statistics />} />
        </Routes>
      </Layout>
    </Router>
  );
}
