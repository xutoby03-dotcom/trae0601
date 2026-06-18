import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useStationStore } from "../../store/stationStore";

const BREADCRUMB_MAP: Record<string, { label: string; to?: string }[]> = {
  "/": [{ label: "总览看板" }],
  "/stations": [
    { label: "设备管理", to: "/stations" },
    { label: "桩位档案" },
  ],
  "/stations/new": [
    { label: "设备管理", to: "/stations" },
    { label: "桩位档案", to: "/stations" },
    { label: "新增桩位" },
  ],
  "/inspections": [
    { label: "运营管理", to: "/inspections/tasks" },
    { label: "巡检管理" },
  ],
  "/inspections/tasks": [
    { label: "运营管理", to: "/inspections/tasks" },
    { label: "巡检任务" },
  ],
  "/inspections/records": [
    { label: "运营管理", to: "/inspections/tasks" },
    { label: "巡检记录" },
  ],
  "/repairs": [
    { label: "运营管理", to: "/repairs/tickets" },
    { label: "报修中心" },
  ],
  "/repairs/submit": [
    { label: "运营管理", to: "/repairs/tickets" },
    { label: "报修中心", to: "/repairs/tickets" },
    { label: "提交报修" },
  ],
  "/repairs/tickets": [
    { label: "运营管理", to: "/repairs/tickets" },
    { label: "报修工单" },
  ],
  "/maintenance": [
    { label: "运营管理", to: "/maintenance/faults" },
    { label: "维修记录" },
  ],
  "/maintenance/faults": [
    { label: "运营管理", to: "/maintenance/faults" },
    { label: "故障管理" },
  ],
  "/maintenance/record": [
    { label: "运营管理", to: "/maintenance/faults" },
    { label: "维修记录", to: "/maintenance/history" },
    { label: "创建维修记录" },
  ],
  "/maintenance/history": [
    { label: "运营管理", to: "/maintenance/faults" },
    { label: "维修历史" },
  ],
  "/statistics": [
    { label: "数据分析", to: "/statistics/fault-rate" },
    { label: "数据统计" },
  ],
  "/statistics/fault-rate": [
    { label: "数据分析", to: "/statistics/fault-rate" },
    { label: "故障率分析" },
  ],
  "/statistics/usage-peak": [
    { label: "数据分析", to: "/statistics/fault-rate" },
    { label: "使用高峰" },
  ],
  "/statistics/pending": [
    { label: "数据分析", to: "/statistics/fault-rate" },
    { label: "未处理报修" },
  ],
  "/statistics/low-efficiency": [
    { label: "数据分析", to: "/statistics/fault-rate" },
    { label: "低效桩分析" },
  ],
};

function getBreadcrumbs(path: string) {
  if (BREADCRUMB_MAP[path]) return BREADCRUMB_MAP[path];
  const segments = path.split("/").filter(Boolean);
  if (segments[0] === "stations" && segments[1] === "edit") {
    return [
      { label: "设备管理", to: "/stations" },
      { label: "桩位档案", to: "/stations" },
      { label: "编辑桩位" },
    ];
  }
  if (segments[0] === "stations" && segments[1] && segments[1] !== "new") {
    return [
      { label: "设备管理", to: "/stations" },
      { label: "桩位档案", to: "/stations" },
      { label: "桩位详情" },
    ];
  }
  if (segments[0] === "inspections" && segments[1] === "execute") {
    return [
      { label: "运营管理", to: "/inspections/tasks" },
      { label: "巡检任务", to: "/inspections/tasks" },
      { label: "执行巡检" },
    ];
  }
  if (segments[0] === "repairs" && segments[1] === "tickets" && segments[2]) {
    return [
      { label: "运营管理", to: "/repairs/tickets" },
      { label: "报修工单", to: "/repairs/tickets" },
      { label: "工单详情" },
    ];
  }
  return [{ label: "首页" }];
}

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    useStationStore.getState().computeStats();
  }, []);

  const breadcrumbs = getBreadcrumbs(location.pathname);

  return (
    <div className="flex h-screen bg-slate-25 overflow-hidden">
      <Sidebar collapsed={collapsed} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onToggleSidebar={() => setCollapsed((v) => !v)}
          breadcrumbs={breadcrumbs}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
