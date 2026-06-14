import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import ClassroomList from "@/pages/ClassroomList";
import Reservation from "@/pages/Reservation";
import Checkin from "@/pages/Checkin";
import Records from "@/pages/Records";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/classrooms" element={<ClassroomList />} />
          <Route path="/reservation" element={<Reservation />} />
          <Route path="/checkin" element={<Checkin />} />
          <Route path="/records" element={<Records />} />
        </Routes>
      </Layout>
    </Router>
  );
}
