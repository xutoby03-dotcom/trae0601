import Sidebar from "./Sidebar";
import Header from "./Header";
import { useLocation } from "react-router-dom";

const PAGE_TITLES: Record<string, string> = {
  "/": "仪表盘",
  "/plants": "绿植档案",
  "/plants/new": "新增绿植",
  "/service": "养护记录",
  "/issues": "问题追踪",
  "/stats": "统计报表",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const pathKey = Object.keys(PAGE_TITLES).find(
    (k) => location.pathname === k || location.pathname.startsWith(k + "/")
  );
  const title =
    pathKey && PAGE_TITLES[pathKey]
      ? PAGE_TITLES[pathKey]
      : location.pathname.startsWith("/plants/")
      ? "绿植详情"
      : "绿植管家";

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="ml-64">
        <Header title={title} />
        <main className="p-8 animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
