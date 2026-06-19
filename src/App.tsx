import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import ToastContainer from "@/components/ToastContainer";
import Dashboard from "@/pages/Dashboard";
import ProductList from "@/pages/ProductList";
import ProductForm from "@/pages/ProductForm";
import SampleList from "@/pages/SampleList";
import SampleForm from "@/pages/SampleForm";
import SampleDetail from "@/pages/SampleDetail";
import IncidentList from "@/pages/IncidentList";
import IncidentForm from "@/pages/IncidentForm";
import DestructionList from "@/pages/DestructionList";

export default function App() {
  return (
    <Router>
      <ToastContainer />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/new" element={<ProductForm />} />
          <Route path="/products/:id" element={<ProductForm />} />
          <Route path="/samples" element={<SampleList />} />
          <Route path="/samples/new" element={<SampleForm />} />
          <Route path="/samples/:id" element={<SampleDetail />} />
          <Route path="/incidents" element={<IncidentList />} />
          <Route path="/incidents/new" element={<IncidentForm />} />
          <Route path="/destruction" element={<DestructionList />} />
        </Route>
      </Routes>
    </Router>
  );
}
