import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header } from "@/components/Header/Header";
import { Editor } from "@/pages/Editor";
import { Gallery } from "@/pages/Gallery";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Header />
        <Routes>
          <Route path="/" element={<Editor />} />
          <Route path="/gallery" element={<Gallery />} />
        </Routes>
      </div>
    </Router>
  );
}
