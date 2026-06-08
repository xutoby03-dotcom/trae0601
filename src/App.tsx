import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import AddProperty from "@/pages/AddProperty";
import PropertyDetail from "@/pages/PropertyDetail";
import Compare from "@/pages/Compare";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<AddProperty />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route path="/property/:id/edit" element={<AddProperty />} />
        <Route path="/compare" element={<Compare />} />
      </Routes>
    </Router>
  );
}
