import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import DeviceProfile from "@/pages/DeviceProfile";
import DryingRecords from "@/pages/DryingRecords";
import CleaningRecords from "@/pages/CleaningRecords";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/device" element={<DeviceProfile />} />
          <Route path="/drying" element={<DryingRecords />} />
          <Route path="/cleaning" element={<CleaningRecords />} />
        </Route>
      </Routes>
    </Router>
  );
}
