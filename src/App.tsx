import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Costumes from "@/pages/Costumes";
import CostumeForm from "@/pages/CostumeForm";
import Reservations from "@/pages/Reservations";
import ReservationForm from "@/pages/ReservationForm";
import Lendings from "@/pages/Lendings";
import Returns from "@/pages/Returns";
import Cleaning from "@/pages/Cleaning";
import Statistics from "@/pages/Statistics";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/costumes" element={<Costumes />} />
          <Route path="/costumes/new" element={<CostumeForm />} />
          <Route path="/costumes/:id/edit" element={<CostumeForm />} />
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/reservations/new" element={<ReservationForm />} />
          <Route path="/lendings" element={<Lendings />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/cleaning" element={<Cleaning />} />
          <Route path="/statistics" element={<Statistics />} />
        </Route>
      </Routes>
    </Router>
  );
}
