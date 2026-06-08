import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import MaterialForm from "@/pages/MaterialForm";
import MaterialDetail from "@/pages/MaterialDetail";
import ColorSearch from "@/pages/ColorSearch";
import Projects from "@/pages/Projects";
import ProjectForm from "@/pages/ProjectForm";
import ProjectDetail from "@/pages/ProjectDetail";
import ShoppingList from "@/pages/ShoppingList";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/material/new" element={<MaterialForm />} />
          <Route path="/material/:id" element={<MaterialDetail />} />
          <Route path="/material/:id/edit" element={<MaterialForm />} />
          <Route path="/color-search" element={<ColorSearch />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/new" element={<ProjectForm />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/shopping-list" element={<ShoppingList />} />
        </Route>
      </Routes>
    </Router>
  );
}
