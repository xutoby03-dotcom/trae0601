import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Notifications from "./Notifications";
import { AlertCircle, Loader2 } from "lucide-react";

interface LayoutProps {
  loading: boolean;
  error: string | null;
}

export default function Layout({ loading, error }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-zinc-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <Notifications />
        {loading && (
          <div className="bg-blue-50 border-b border-blue-200 px-6 py-2 flex items-center gap-2 text-sm text-blue-700">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>数据加载中...</span>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-2 flex items-center gap-2 text-sm text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span>错误：{error}</span>
          </div>
        )}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
