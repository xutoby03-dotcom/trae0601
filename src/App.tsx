import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Inspections from "@/pages/Inspections";
import Notifications from "@/pages/Notifications";
import Recheck from "@/pages/Recheck";
import Statistics from "@/pages/Statistics";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Layout title="总览看板" subtitle="楼道杂物清理数据概览">
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/inspections"
          element={
            <Layout title="巡查记录" subtitle="楼道杂物巡查记录管理">
              <Inspections />
            </Layout>
          }
        />
        <Route
          path="/notifications"
          element={
            <Layout title="通知管理" subtitle="清理通知发送与反馈跟踪">
              <Notifications />
            </Layout>
          }
        />
        <Route
          path="/recheck"
          element={
            <Layout title="复查列表" subtitle="超期未清理记录复查">
              <Recheck />
            </Layout>
          }
        />
        <Route
          path="/statistics"
          element={
            <Layout title="统计分析" subtitle="多维度数据统计与分析">
              <Statistics />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}
