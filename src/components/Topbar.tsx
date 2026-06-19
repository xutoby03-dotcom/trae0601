import { useLocation } from "react-router-dom";
import { Bell, Search } from "lucide-react";

const titleMap: Record<string, string> = {
  "/dashboard": "数据看板",
  "/students": "学生档案管理",
  "/products": "商品档案管理",
  "/orders": "补订申请管理",
  "/purchases": "采购清单管理",
};

interface Props {
  subtitle?: string;
}

export default function Topbar({ subtitle }: Props) {
  const location = useLocation();
  const title = titleMap[location.pathname] || "校服补订系统";
  const today = new Date().toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <div>
        <h2 className="text-xl font-bold text-zinc-800">{title}</h2>
        {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
        {!subtitle && <p className="text-xs text-zinc-500 mt-0.5">{today}</p>}
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="搜索学生、订单..."
            className="w-64 pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <button className="relative w-9 h-9 rounded-lg border border-zinc-200 hover:bg-zinc-50 flex items-center justify-center text-zinc-500">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500"></span>
        </button>
      </div>
    </header>
  );
}
