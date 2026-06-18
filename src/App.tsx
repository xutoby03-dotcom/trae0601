import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import StationList from "./pages/stations/List";
import StationDetail from "./pages/stations/Detail";
import StationForm from "./pages/stations/Form";
import InspectionTasks from "./pages/inspections/Tasks";
import InspectionExecute from "./pages/inspections/Execute";
import InspectionRecords from "./pages/inspections/Records";
import RepairSubmit from "./pages/repairs/Submit";
import RepairTickets from "./pages/repairs/Tickets";
import RepairDetail from "./pages/repairs/Detail";
import MaintenanceFaults from "./pages/maintenance/Faults";
import MaintenanceRecordForm from "./pages/maintenance/RecordForm";
import MaintenanceHistory from "./pages/maintenance/History";
import StatisticsFaultRate from "./pages/statistics/FaultRate";
import StatisticsUsagePeak from "./pages/statistics/UsagePeak";
import StatisticsPending from "./pages/statistics/Pending";
import StatisticsLowEfficiency from "./pages/statistics/LowEfficiency";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/stations" element={<StationList />} />
          <Route path="/stations/new" element={<StationForm />} />
          <Route path="/stations/edit/:id" element={<StationForm />} />
          <Route path="/stations/:id" element={<StationDetail />} />
          <Route path="/inspections/tasks" element={<InspectionTasks />} />
          <Route path="/inspections/execute/:id" element={<InspectionExecute />} />
          <Route path="/inspections/records" element={<InspectionRecords />} />
          <Route path="/repairs/submit" element={<RepairSubmit />} />
          <Route path="/repairs/tickets" element={<RepairTickets />} />
          <Route path="/repairs/tickets/:id" element={<RepairDetail />} />
          <Route path="/maintenance/faults" element={<MaintenanceFaults />} />
          <Route path="/maintenance/record" element={<MaintenanceRecordForm />} />
          <Route path="/maintenance/history" element={<MaintenanceHistory />} />
          <Route path="/statistics/fault-rate" element={<StatisticsFaultRate />} />
          <Route path="/statistics/usage-peak" element={<StatisticsUsagePeak />} />
          <Route path="/statistics/pending" element={<StatisticsPending />} />
          <Route
            path="/statistics/low-efficiency"
            element={<StatisticsLowEfficiency />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
