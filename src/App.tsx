import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Exams from "@/pages/Exams";
import Inventory from "@/pages/Inventory";
import Distribution from "@/pages/Distribution";
import Collection from "@/pages/Collection";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/exams" element={<Exams />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/distribution" element={<Distribution />} />
          <Route path="/collection" element={<Collection />} />
        </Route>
      </Routes>
    </Router>
  );
}
