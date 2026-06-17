import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/layout/Header";
import Dashboard from "@/pages/Dashboard";
import VehicleList from "@/pages/VehicleList";
import VehicleForm from "@/pages/VehicleForm";
import SeatList from "@/pages/SeatList";
import SeatForm from "@/pages/SeatForm";
import InspectionPage from "@/pages/InspectionPage";
import QuickCheckCard from "@/pages/QuickCheckCard";
import TaskList from "@/pages/TaskList";
import StatisticsPage from "@/pages/StatisticsPage";
import ReminderCenter from "@/pages/ReminderCenter";
import { useVehicleStore } from "@/store/useVehicleStore";
import { useSeatStore } from "@/store/useSeatStore";
import { useInstallationStore } from "@/store/useInstallationStore";
import { useInspectionStore } from "@/store/useInspectionStore";
import { useTaskStore } from "@/store/useTaskStore";
import { useReminderStore } from "@/store/useReminderStore";
import { useChildProfileStore } from "@/store/useChildProfileStore";
import { initMockData } from "@/mock";
import { generateAllReminders } from "@/utils/reminder";

function AppContent() {
  const { vehicles, setVehicles } = useVehicleStore();
  const { seats, setSeats } = useSeatStore();
  const { installations, setInstallations } = useInstallationStore();
  const { inspections, setInspections } = useInspectionStore();
  const { tasks, setTasks } = useTaskStore();
  const { reminders, setReminders, refreshReminders } = useReminderStore();
  const { childProfile, setChildProfileDirect } = useChildProfileStore();

  useEffect(() => {
    if (vehicles.length === 0 && seats.length === 0) {
      initMockData(
        setVehicles,
        setSeats,
        setInstallations,
        setInspections,
        setTasks,
        setReminders,
        setChildProfileDirect
      );
    }
  }, [vehicles.length, seats.length, setVehicles, setSeats, setInstallations, setInspections, setTasks, setReminders, setChildProfileDirect]);

  useEffect(() => {
    if (seats.length > 0) {
      const newReminders = generateAllReminders(seats, inspections, childProfile);
      if (newReminders.length > 0) {
        refreshReminders(newReminders);
      }
    }
  }, [seats, inspections, childProfile, refreshReminders]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/vehicles" element={<VehicleList />} />
          <Route path="/vehicles/new" element={<VehicleForm />} />
          <Route path="/vehicles/edit/:id" element={<VehicleForm />} />
          <Route path="/seats" element={<SeatList />} />
          <Route path="/seats/new" element={<SeatForm />} />
          <Route path="/seats/edit/:id" element={<SeatForm />} />
          <Route path="/inspection" element={<InspectionPage />} />
          <Route path="/quick-check/:id" element={<QuickCheckCard />} />
          <Route path="/tasks" element={<TaskList />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/reminders" element={<ReminderCenter />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
