import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import OrderList from "@/pages/OrderList";
import OrderDetail from "@/pages/OrderDetail";
import History from "@/pages/History";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<OrderList />} />
        <Route path="/order/:id" element={<OrderDetail />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </Router>
  );
}
