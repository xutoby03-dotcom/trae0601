import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import MainLayout from './components/Layout/MainLayout';
import PointPage from './pages/PointPage';
import InspectionPage from './pages/InspectionPage';
import AnomalyPage from './pages/AnomalyPage';
import StatisticsPage from './pages/StatisticsPage';

export default function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#DC2626',
          borderRadius: 8,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif',
        },
        components: {
          Button: {
            controlHeight: 36,
            borderRadius: 8,
          },
          Card: {
            borderRadiusLG: 12,
          },
          Table: {
            borderRadius: 12,
          },
        },
      }}
    >
      <AntdApp>
        <Router>
          <MainLayout>
            <Routes>
              <Route path="/" element={<PointPage />} />
              <Route path="/inspection" element={<InspectionPage />} />
              <Route path="/anomaly" element={<AnomalyPage />} />
              <Route path="/statistics" element={<StatisticsPage />} />
            </Routes>
          </MainLayout>
        </Router>
      </AntdApp>
    </ConfigProvider>
  );
}
