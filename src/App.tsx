import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout/Layout";
import Dashboard from "@/pages/Dashboard/Dashboard";
import Tableware from "@/pages/Tableware/Tableware";
import Inspection from "@/pages/Inspection/Inspection";
import Report from "@/pages/Report/Report";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tableware" element={<Tableware />} />
          <Route path="/inspection" element={<Inspection />} />
          <Route path="/report" element={<Report />} />
        </Routes>
      </Layout>
    </Router>
  );
}
