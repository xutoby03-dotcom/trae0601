import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import PatientList from "@/pages/PatientList";
import PatientDetail from "@/pages/PatientDetail";
import VisitList from "@/pages/VisitList";
import VisitDetail from "@/pages/VisitDetail";
import RecordList from "@/pages/RecordList";
import Statistics from "@/pages/Statistics";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/patients" element={<PatientList />} />
          <Route path="/patients/:id" element={<PatientDetail />} />
          <Route path="/visits" element={<VisitList />} />
          <Route path="/visits/:id" element={<VisitDetail />} />
          <Route path="/records" element={<RecordList />} />
          <Route path="/stats" element={<Statistics />} />
          <Route path="*" element={
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">页面未找到</h2>
              <p className="text-gray-500">404 - 页面不存在</p>
            </div>
          } />
        </Routes>
      </Layout>
    </Router>
  );
}
