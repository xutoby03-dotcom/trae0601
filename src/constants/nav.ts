import {
  LayoutDashboard,
  PackageOpen,
  FlaskConical,
  AlertTriangle,
  Trash2,
  Utensils,
} from "lucide-react";

export const navItems = [
  { path: "/", label: "数据看板", icon: LayoutDashboard },
  { path: "/products", label: "商品档案", icon: PackageOpen },
  { path: "/samples", label: "留样记录", icon: FlaskConical },
  { path: "/incidents", label: "异常事件", icon: AlertTriangle },
  { path: "/destruction", label: "销毁确认", icon: Trash2 },
];

export { Utensils as BrandIcon };
