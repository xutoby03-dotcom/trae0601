import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import PointList from "@/pages/points/PointList";
import PointDetail from "@/pages/points/PointDetail";
import PointForm from "@/pages/points/PointForm";
import InspectionList from "@/pages/inspections/InspectionList";
import InspectionDetail from "@/pages/inspections/InspectionDetail";
import NewInspection from "@/pages/inspections/NewInspection";
import TicketList from "@/pages/tickets/TicketList";
import TicketDetail from "@/pages/tickets/TicketDetail";
import TicketForm from "@/pages/tickets/TicketForm";
import PromotionList from "@/pages/promotions/PromotionList";
import PromotionDetail from "@/pages/promotions/PromotionDetail";
import NewPromotion from "@/pages/promotions/NewPromotion";
import Statistics from "@/pages/statistics/Statistics";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/points" element={<PointList />} />
          <Route path="/points/new" element={<PointForm />} />
          <Route path="/points/:id" element={<PointDetail />} />
          <Route path="/points/:id/edit" element={<PointForm />} />
          <Route path="/inspections" element={<InspectionList />} />
          <Route path="/inspections/new" element={<NewInspection />} />
          <Route path="/inspections/:id" element={<InspectionDetail />} />
          <Route path="/tickets" element={<TicketList />} />
          <Route path="/tickets/new" element={<TicketForm />} />
          <Route path="/tickets/:id" element={<TicketDetail />} />
          <Route path="/promotions" element={<PromotionList />} />
          <Route path="/promotions/new" element={<NewPromotion />} />
          <Route path="/promotions/:id" element={<PromotionDetail />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
