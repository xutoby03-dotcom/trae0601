import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import BoxList from "@/pages/BoxList";
import BoxDetail from "@/pages/BoxDetail";
import Borrow from "@/pages/Borrow";
import Friends from "@/pages/Friends";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="boxes" element={<BoxList />} />
          <Route path="boxes/:id" element={<BoxDetail />} />
          <Route path="borrow" element={<Borrow />} />
          <Route path="friends" element={<Friends />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
