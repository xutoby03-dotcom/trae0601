import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import DashboardPage from './pages/Dashboard/DashboardPage';
import GuestListPage from './pages/GuestList/GuestListPage';
import CheckInPage from './pages/CheckIn/CheckInPage';
import FeedbackPage from './pages/Feedback/FeedbackPage';
import RemindersPage from './pages/Reminders/RemindersPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route element={<MainLayout title="老板看板" subtitle="试营业数据概览与分析" />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
        
        <Route element={<MainLayout title="名单管理" subtitle="邀约客户信息管理" />}>
          <Route path="/guests" element={<GuestListPage />} />
        </Route>
        
        <Route element={<MainLayout title="签到管理" subtitle="客户到店签到与签退" />}>
          <Route path="/checkin" element={<CheckInPage />} />
        </Route>
        
        <Route element={<MainLayout title="反馈收集" subtitle="客户体验反馈管理" />}>
          <Route path="/feedback" element={<FeedbackPage />} />
        </Route>
        
        <Route element={<MainLayout title="提醒中心" subtitle="待处理事项提醒" />}>
          <Route path="/reminders" element={<RemindersPage />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
