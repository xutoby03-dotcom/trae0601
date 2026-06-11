import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import ReportList from "@/pages/ReportList";
import ReportNew from "@/pages/ReportNew";
import ReportDetail from "@/pages/ReportDetail";
import IndicatorDetail from "@/pages/IndicatorDetail";
import { useEffect, useMemo, useCallback } from "react";
import { useHealthStore } from "@/store";

export default function App() {
  const reports = useHealthStore((s) => s.reports);
  const initMockData = useHealthStore((s) => s.initMockData);

  const hasData = useMemo(() => reports.length > 0, [reports]);
  const handleInitMockData = useCallback(() => initMockData(), [initMockData]);

  useEffect(() => {
    if (!hasData) {
      handleInitMockData();
    }
  }, [hasData, handleInitMockData]);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/reports" element={<ReportList />} />
          <Route path="/reports/new" element={<ReportNew />} />
          <Route path="/reports/:id" element={<ReportDetail />} />
          <Route path="/indicators/:id" element={<IndicatorDetail />} />
        </Routes>
      </Layout>
    </Router>
  );
}
