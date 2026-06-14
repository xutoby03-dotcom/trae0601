import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { ConfigProvider, App as AntdApp } from "antd";
import zhCN from "antd/locale/zh_CN";
import MainLayout from "@/components/Layout/MainLayout";
import Dashboard from "@/pages/Dashboard";
import Statistics from "@/pages/Statistics";
import { FacilityList, FacilityForm, FacilityDetail } from "@/pages/Facility";
import { RepairList, RepairForm, RepairDetail } from "@/pages/Repair";
import Home from "@/pages/Home";
import { useFacilityStore, useRepairStore, useInspectionStore } from "@/store";
import { mockFacilities, mockRepairs, mockRepairPhotos, mockMaintenanceLogs, mockInspections } from "@/data/mockData";

const themeConfig = {
  token: {
    colorPrimary: "#FF6B35",
    colorInfo: "#FF6B35",
    colorSuccess: "#2A9D8F",
    colorWarning: "#FFB703",
    colorError: "#E63946",
    borderRadius: 8,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
  },
  components: {
    Button: {
      borderRadius: 12,
      controlHeight: 40,
      colorPrimaryHover: "#FF8A5C",
      colorPrimaryActive: "#E55A2B",
      primaryShadow: "0 4px 12px rgba(255, 107, 53, 0.35)",
    },
    Card: {
      borderRadius: 16,
      boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
    },
    Table: {
      borderRadius: 12,
      headerBg: "#FAFBFC",
      headerColor: "#333",
    },
    Tag: {
      borderRadius: 8,
    },
    Input: {
      borderRadius: 10,
    },
    Select: {
      borderRadius: 10,
    },
    DatePicker: {
      borderRadius: 10,
    },
    Form: {
      itemMarginBottom: 20,
    },
    Menu: {
      itemBorderRadius: 10,
      itemHoverBg: "#FFF3EE",
      itemSelectedBg: "#FFF3EE",
      itemSelectedColor: "#FF6B35",
      darkItemBg: "transparent",
    },
    Steps: {
      colorPrimary: "#FF6B35",
    },
    Progress: {
      colorInfo: "#FF6B35",
    },
  },
};

function AppRoutes() {
  const { facilities } = useFacilityStore();
  const { repairs } = useRepairStore();
  const { inspections } = useInspectionStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    if (facilities.length === 0) {
      useFacilityStore.setState({ facilities: [...mockFacilities] });
    }
    if (repairs.length === 0) {
      useRepairStore.setState({
        repairs: [...mockRepairs],
        repairPhotos: [...mockRepairPhotos],
        maintenanceLogs: [...mockMaintenanceLogs],
      });
    }
    if (inspections.length === 0) {
      useInspectionStore.setState({ inspections: [...mockInspections] });
    }
    initialized.current = true;
  }, [facilities.length, repairs.length, inspections.length]);

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="facilities" element={<FacilityList />} />
        <Route path="facilities/new" element={<FacilityForm />} />
        <Route path="facilities/:id" element={<FacilityDetail />} />
        <Route path="facilities/:id/edit" element={<FacilityForm />} />
        <Route path="repairs" element={<RepairList />} />
        <Route path="repairs/new" element={<RepairForm />} />
        <Route path="repairs/:id" element={<RepairDetail />} />
        <Route path="statistics" element={<Statistics />} />
        <Route path="home" element={<Home />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <ConfigProvider locale={zhCN} theme={themeConfig}>
      <AntdApp>
        <Router>
          <AppRoutes />
        </Router>
      </AntdApp>
    </ConfigProvider>
  );
}
