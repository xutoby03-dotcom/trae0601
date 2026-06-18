import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "@/components/Layout/MainLayout";
import Dashboard from "@/pages/Dashboard/Dashboard";
import PetList from "@/pages/Pet/PetList";
import PetForm from "@/pages/Pet/PetForm";
import PetDetail from "@/pages/Pet/PetDetail";
import VaccinationList from "@/pages/Vaccination/VaccinationList";
import VaccinationCheck from "@/pages/Vaccination/VaccinationCheck";
import StayList from "@/pages/Stay/StayList";
import StayForm from "@/pages/Stay/StayForm";
import StayDetail from "@/pages/Stay/StayDetail";
import DailyRecordList from "@/pages/DailyRecord/DailyRecordList";
import RecordCalendar from "@/pages/DailyRecord/RecordCalendar";
import Settings from "@/pages/Settings/Settings";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pets" element={<PetList />} />
          <Route path="pets/new" element={<PetForm />} />
          <Route path="pets/:id" element={<PetDetail />} />
          <Route path="pets/:id/edit" element={<PetForm />} />
          <Route path="vaccination" element={<VaccinationList />} />
          <Route path="vaccination/check/:petId" element={<VaccinationCheck />} />
          <Route path="stays" element={<StayList />} />
          <Route path="stays/new" element={<StayForm />} />
          <Route path="stays/:id" element={<StayDetail />} />
          <Route path="daily-records" element={<DailyRecordList />} />
          <Route path="daily-records/calendar" element={<RecordCalendar />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}
