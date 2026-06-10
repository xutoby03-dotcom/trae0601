import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Home from "@/pages/Home";
import DocumentForm from "@/pages/DocumentForm";
import DocumentDetail from "@/pages/DocumentDetail";
import Statistics from "@/pages/Statistics";
import Settings from "@/pages/Settings";
import { useDocumentStore } from "@/store/documentStore";
import { useEffect } from "react";
import { generateMockData } from "@/utils/mockData";

export default function App() {
  const { documents } = useDocumentStore();

  useEffect(() => {
    if (documents.length === 0) {
      generateMockData();
    }
  }, [documents.length]);

  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/add" element={<DocumentForm />} />
          <Route path="/edit/:id" element={<DocumentForm />} />
          <Route path="/document/:id" element={<DocumentDetail />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}
