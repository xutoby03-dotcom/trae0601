import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import BracesList from "@/pages/BracesList";
import BracesForm from "@/pages/BracesForm";
import Records from "@/pages/Records";
import Reminders from "@/pages/Reminders";
import CheckupList from "@/pages/CheckupList";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/braces" element={<BracesList />} />
          <Route path="/braces/new" element={<BracesForm />} />
          <Route path="/braces/:id/edit" element={<BracesForm />} />
          <Route path="/records" element={<Records />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/checkup" element={<CheckupList />} />
        </Route>
      </Routes>
    </Router>
  );
}
