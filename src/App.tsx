import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout/Layout";
import Dashboard from "@/pages/Dashboard/Dashboard";
import RoomList from "@/pages/Rooms/RoomList";
import RoomDetail from "@/pages/Rooms/RoomDetail";
import RoomForm from "@/pages/Rooms/RoomForm";
import InspectionList from "@/pages/Inspections/InspectionList";
import InspectionDetail from "@/pages/Inspections/InspectionDetail";
import InspectionForm from "@/pages/Inspections/InspectionForm";
import ComplaintList from "@/pages/Complaints/ComplaintList";
import ComplaintDetail from "@/pages/Complaints/ComplaintDetail";
import ComplaintForm from "@/pages/Complaints/ComplaintForm";
import RepairList from "@/pages/Repairs/RepairList";
import RepairDetail from "@/pages/Repairs/RepairDetail";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/rooms" element={<RoomList />} />
          <Route path="/rooms/new" element={<RoomForm />} />
          <Route path="/rooms/:id" element={<RoomDetail />} />
          <Route path="/rooms/:id/edit" element={<RoomForm />} />
          <Route path="/inspections" element={<InspectionList />} />
          <Route path="/inspections/new" element={<InspectionForm />} />
          <Route path="/inspections/:id" element={<InspectionDetail />} />
          <Route path="/complaints" element={<ComplaintList />} />
          <Route path="/complaints/new" element={<ComplaintForm />} />
          <Route path="/complaints/:id" element={<ComplaintDetail />} />
          <Route path="/repairs" element={<RepairList />} />
          <Route path="/repairs/:id" element={<RepairDetail />} />
        </Route>
      </Routes>
    </Router>
  );
}
