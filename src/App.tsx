import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "@/components/common/Header";
import Dashboard from "@/pages/Dashboard";
import OrderDetail from "@/pages/OrderDetail";
import NewOrder from "@/pages/NewOrder";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/order/new" element={<NewOrder />} />
            <Route path="/order/:id" element={<OrderDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
