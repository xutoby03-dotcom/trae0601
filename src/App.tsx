import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header } from "@/components/Header";
import { HomePage } from "@/pages/HomePage";
import { DetailPage } from "@/pages/DetailPage";
import { FormPage } from "@/pages/FormPage";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-stone-50">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/perfume/:id" element={<DetailPage />} />
          <Route path="/new" element={<FormPage />} />
          <Route path="/edit/:id" element={<FormPage />} />
        </Routes>
      </div>
    </Router>
  );
}
