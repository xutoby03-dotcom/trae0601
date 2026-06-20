import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import Bills from "@/pages/Bills";
import Stats from "@/pages/Stats";
import Alerts from "@/pages/Alerts";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/bills" element={<Bills />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/alerts" element={<Alerts />} />
        </Route>
      </Routes>
    </Router>
  );
}
