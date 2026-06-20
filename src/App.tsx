import { HashRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import PlanPage from "@/pages/PlanPage";
import ChecklistPage from "@/pages/ChecklistPage";
import RecordPage from "@/pages/RecordPage";
import LibraryPage from "@/pages/LibraryPage";

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<PlanPage />} />
          <Route path="/checklist" element={<ChecklistPage />} />
          <Route path="/record/:date" element={<RecordPage />} />
          <Route path="/history" element={<RecordPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="*" element={<PlanPage />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}
