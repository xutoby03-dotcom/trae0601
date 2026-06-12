import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import ToastProvider from "@/components/ToastProvider";
import Home from "@/pages/Home";
import MenuPage from "@/pages/MenuPage";
import OrdersPage from "@/pages/OrdersPage";
import KitchenPage from "@/pages/KitchenPage";
import StatsPage from "@/pages/StatsPage";

export default function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/kitchen" element={<KitchenPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="*" element={<Home />} />
          </Route>
        </Routes>
      </Router>
    </ToastProvider>
  );
}
