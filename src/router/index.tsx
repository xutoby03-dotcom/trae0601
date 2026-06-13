import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import Dashboard from "@/pages/Dashboard";
import InstrumentsList from "@/pages/instruments/InstrumentsList";
import RepairsList from "@/pages/repairs/RepairsList";
import NewRepairForm from "@/pages/repairs/NewRepairForm";
import RepairDetail from "@/pages/repairs/RepairDetail";
import Workbench from "@/pages/Workbench";
import Statistics from "@/pages/Statistics";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/instruments" element={<InstrumentsList />} />
          <Route path="/repairs" element={<RepairsList />} />
          <Route path="/repairs/new" element={<NewRepairForm />} />
          <Route path="/repairs/:id" element={<RepairDetail />} />
          <Route path="/workbench" element={<Workbench />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
