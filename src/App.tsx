import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import MaterialBoard from "@/pages/MaterialBoard";
import AfterSales from "@/pages/AfterSales";
import RoomView from "@/pages/RoomView";
import Summary from "@/pages/Summary";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<MaterialBoard />} />
          <Route path="/after-sales" element={<AfterSales />} />
          <Route path="/rooms" element={<RoomView />} />
          <Route path="/summary" element={<Summary />} />
        </Route>
      </Routes>
    </Router>
  );
}
