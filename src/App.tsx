import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Home from "@/pages/Home";
import ActivityDetail from "@/pages/ActivityDetail";
import CreateActivity from "@/pages/CreateActivity";
import History from "@/pages/History";

function Layout() {
  return (
    <div className="min-h-screen bg-dark-bg font-body">
      <Navbar />
      <Outlet />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/activity/:id" element={<ActivityDetail />} />
          <Route path="/activity/new" element={<CreateActivity />} />
          <Route path="/activity/:id/edit" element={<CreateActivity />} />
          <Route path="/history" element={<History />} />
        </Route>
      </Routes>
    </Router>
  );
}
