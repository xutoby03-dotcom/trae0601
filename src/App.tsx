import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Dashboard } from "@/pages/Dashboard";
import { GearArchive } from "@/pages/GearArchive";
import { LendReturn } from "@/pages/LendReturn";
import { Statistics } from "@/pages/Statistics";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/archive" element={<GearArchive />} />
          <Route path="/lend-return" element={<LendReturn />} />
          <Route path="/statistics" element={<Statistics />} />
        </Routes>
      </Layout>
    </Router>
  );
}
