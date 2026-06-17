import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Cylinders from "@/pages/Cylinders";
import Inflation from "@/pages/Inflation";
import Abnormal from "@/pages/Abnormal";
import Statistics from "@/pages/Statistics";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/cylinders" replace />} />
          <Route path="cylinders" element={<Cylinders />} />
          <Route path="inflation" element={<Inflation />} />
          <Route path="abnormal" element={<Abnormal />} />
          <Route path="statistics" element={<Statistics />} />
        </Route>
      </Routes>
    </Router>
  );
}
