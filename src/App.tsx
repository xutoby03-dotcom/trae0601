import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "@/components/NavBar";
import EquipmentList from "@/pages/EquipmentList";
import ReturnManage from "@/pages/ReturnManage";
import Statistics from "@/pages/Statistics";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <NavBar />
        <Routes>
          <Route path="/" element={<EquipmentList />} />
          <Route path="/return" element={<ReturnManage />} />
          <Route path="/stats" element={<Statistics />} />
        </Routes>
      </div>
    </Router>
  );
}
