import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FoodList from "@/pages/FoodList";
import Overview from "@/pages/Overview";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FoodList />} />
        <Route path="/overview" element={<Overview />} />
      </Routes>
    </Router>
  );
}
