import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import BeanForm from "@/pages/BeanForm";
import BeanDetail from "@/pages/BeanDetail";
import BrewForm from "@/pages/BrewForm";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/beans/new" element={<BeanForm />} />
        <Route path="/beans/:id" element={<BeanDetail />} />
        <Route path="/beans/:id/edit" element={<BeanForm />} />
        <Route path="/brews/new" element={<BrewForm />} />
      </Routes>
    </Router>
  );
}
