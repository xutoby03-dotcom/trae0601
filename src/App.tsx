import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ToastProvider } from "@/components/Toast";
import { Dashboard } from "@/pages/Dashboard";
import { CreateOrder } from "@/pages/CreateOrder";
import { Inventory } from "@/pages/Inventory";
import { Statistics } from "@/pages/Statistics";
import { OrderDetail } from "@/pages/OrderDetail";

export default function App() {
  return (
    <ToastProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<CreateOrder />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/order/:id" element={<OrderDetail />} />
          </Routes>
        </Layout>
      </Router>
    </ToastProvider>
  );
}
