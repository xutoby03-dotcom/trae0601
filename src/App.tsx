import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import RouteList from "@/pages/RouteList";
import RouteEditor from "@/pages/RouteEditor";
import GuideMode from "@/pages/GuideMode";
import Report from "@/pages/Report";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/routes" element={<RouteList />} />
        <Route path="/routes/new" element={<RouteEditor />} />
        <Route path="/routes/:id/edit" element={<RouteEditor />} />
        <Route path="/guide/:id" element={<GuideMode />} />
        <Route path="/report/:sessionId" element={<Report />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}
