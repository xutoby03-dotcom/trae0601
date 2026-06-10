import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Home } from "@/pages/Home";
import { Publish } from "@/pages/Publish";
import { Detail } from "@/pages/Detail";
import { Statistics } from "@/pages/Statistics";
import { FoundRecord } from "@/pages/FoundRecord";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/publish" element={<Publish />} />
          <Route path="/detail/:id" element={<Detail />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/found/:id" element={<FoundRecord />} />
        </Routes>
      </Layout>
    </Router>
  );
}
