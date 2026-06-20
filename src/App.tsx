import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { WallOverview } from "@/pages/WallOverview";
import { PatrolPage } from "@/pages/Patrol";
import { FeedbackPage } from "@/pages/Feedback";
import { RouteManagePage } from "@/pages/RouteManage";
import { ReviewPage } from "@/pages/Review";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<WallOverview />} />
          <Route path="/patrol" element={<PatrolPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/routes" element={<RouteManagePage />} />
          <Route path="/review" element={<ReviewPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
