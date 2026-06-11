import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Home from "@/pages/Home";
import Pets from "@/pages/Pets";
import Medicines from "@/pages/Medicines";
import Statistics from "@/pages/Statistics";
import Layout from "@/components/Layout";
import useAppStore from "@/store/useAppStore";

export default function App() {
  const init = useAppStore(state => state.init);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pets" element={<Pets />} />
          <Route path="/medicines" element={<Medicines />} />
          <Route path="/statistics" element={<Statistics />} />
        </Routes>
      </Layout>
    </Router>
  );
}
