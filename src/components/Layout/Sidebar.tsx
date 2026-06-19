import { useLocation, useNavigate } from "react-router-dom";
import {
  UtensilsCrossed,
  Users,
  ClipboardList,
  Package,
  QrCode,
  BarChart3,
  Salad,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { path: "/orders", label: "团购订单", icon: ClipboardList },
  { path: "/packing", label: "到货分装", icon: Package },
  { path: "/pickup", label: "取餐确认", icon: QrCode },
  { path: "/employees", label: "员工档案", icon: Users },
  { path: "/stats", label: "数据统计", icon: BarChart3 },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="w-64 h-full bg-white border-r border-neutral-100 flex flex-col shrink-0">
      <div className="px-6 py-6 flex items-center gap-3 border-b border-neutral-100">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-400 flex items-center justify-center shadow-button">
          <UtensilsCrossed className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold text-neutral-800 leading-tight">
            午餐管家
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">团购分装系统</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scroll-thin">
        {NAV_ITEMS.map((item) => {
          const active = location.pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "nav-item w-full",
                active && "nav-item-active"
              )}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 m-4 rounded-card bg-gradient-to-br from-brand-50 via-white to-success-50 border border-brand-100">
        <div className="flex items-center gap-2 text-neutral-700 mb-2">
          <Salad className="w-4 h-4 text-brand-500" />
          <span className="text-sm font-medium">小提示</span>
        </div>
        <p className="text-xs text-neutral-500 leading-relaxed">
          每日到货后请先进入「到货分装」页按取餐点核对，发现异常及时拍照记录哦～
        </p>
      </div>
    </aside>
  );
}
