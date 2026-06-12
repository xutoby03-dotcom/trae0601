import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Wardrobe from "@/pages/Wardrobe";
import Outfit from "@/pages/Outfit";
import Idle from "@/pages/Idle";
import Stats from "@/pages/Stats";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Wardrobe />} />
          <Route path="/outfit" element={<Outfit />} />
          <Route path="/idle" element={<Idle />} />
          <Route path="/stats" element={<Stats />} />
        </Routes>
      </Layout>
    </Router>
  );
}
