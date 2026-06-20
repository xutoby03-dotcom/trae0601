import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import SongEditor from "@/pages/SongEditor";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/song/:id" element={<SongEditor />} />
      </Routes>
    </Router>
  );
}
