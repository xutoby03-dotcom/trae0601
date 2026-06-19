import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "@/components/Layout/Sidebar";
import TopBar from "@/components/Layout/TopBar";
import OrdersPage from "@/pages/Orders";
import EmployeesPage from "@/pages/Employees";
import PackingPage from "@/pages/Packing";
import PickupPage from "@/pages/Pickup";
import StatsPage from "@/pages/Stats";
import { useEmployeeStore } from "@/store/employee";
import { useOrderStore } from "@/store/order";
import { useExceptionStore } from "@/store/exception";

export default function App() {
  const employeeCount = useEmployeeStore((s) => s.employees.length);
  const orderCount = useOrderStore((s) => s.orders.length);
  const exceptionCount = useExceptionStore((s) => s.exceptions.length);
  const [inited, setInited] = useState({ emp: false, ord: false, exc: false });

  useEffect(() => {
    useEmployeeStore.getState().initMockData();
    setInited((v) => ({ ...v, emp: true }));
  }, []);

  useEffect(() => {
    if (employeeCount > 0 && !inited.ord) {
      useOrderStore.getState().initMockData();
      setInited((v) => ({ ...v, ord: true }));
    }
  }, [employeeCount, inited.ord]);

  useEffect(() => {
    if (employeeCount > 0 && orderCount > 0 && !inited.exc) {
      useExceptionStore.getState().initMockData();
      setInited((v) => ({ ...v, exc: true }));
    }
  }, [employeeCount, orderCount, inited.exc]);

  return (
    <BrowserRouter>
      <div className="h-screen w-screen flex overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 overflow-y-auto scroll-thin p-6 md:p-8 bg-gradient-to-br from-white via-transparent to-brand-50/30">
            <div className="container max-w-[1400px]">
              <Routes>
                <Route path="/" element={<Navigate to="/orders" replace />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/employees" element={<EmployeesPage />} />
                <Route path="/packing" element={<PackingPage />} />
                <Route path="/pickup" element={<PickupPage />} />
                <Route path="/stats" element={<StatsPage />} />
                <Route path="*" element={<Navigate to="/orders" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
