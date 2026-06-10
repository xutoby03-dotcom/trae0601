import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import ToyDetail from "@/pages/ToyDetail";
import ToyForm from "@/pages/ToyForm";
import Stats from "@/pages/Stats";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/toy/:id" element={<ToyDetail />} />
        <Route path="/add" element={<ToyForm />} />
        <Route path="/edit/:id" element={<ToyForm />} />
        <Route path="/stats" element={<Stats />} />
      </Routes>
    </Router>
  );
}
