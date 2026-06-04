import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { EditorPage } from "@/pages/EditorPage";
import { PreviewPage } from "@/pages/PreviewPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EditorPage />} />
        <Route path="/preview/:id" element={<PreviewPage />} />
      </Routes>
    </Router>
  );
}
