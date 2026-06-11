import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Plans from "./pages/Plans";
import Team from "./pages/Team";
import Tickets from "./pages/Tickets";
import Stats from "./pages/Stats";

export default function App() {
  return (
    <Router>
      <Layout>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/team" element={<Team />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/stats" element={<Stats />} />
          </Routes>
        </AnimatePresence>
      </Layout>
    </Router>
  );
}
