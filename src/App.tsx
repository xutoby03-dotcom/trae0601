import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Add from "@/pages/Add";
import Shopping from "@/pages/Shopping";
import Recipes from "@/pages/Recipes";
import Stats from "@/pages/Stats";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/add" element={<Add />} />
          <Route path="/shopping" element={<Shopping />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/stats" element={<Stats />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
