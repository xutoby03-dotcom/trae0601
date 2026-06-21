import { useLocation, useNavigate } from "react-router-dom";
import {
  Map,
  Library,
  FolderPlus,
  Settings,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const recordings = useUIStore((s) => s.recordings);

  const getActiveItem = (path: string) => {
    if (path === "/map") return "map";
    if (path === "/library") return "library";
    if (path === "/projects") return "projects";
    return "map";
  };

  const activeItem = getActiveItem(location.pathname);

  const items = [
    { key: "map", icon: Map, label: "地图", path: "/map" },
    { key: "library", icon: Library, label: "素材库", path: "/library" },
    {
      key: "projects",
      icon: FolderPlus,
      label: "项目",
      path: "/projects",
    },
    { key: "settings", icon: Settings, label: "设置", path: "#" },
    { key: "help", icon: HelpCircle, label: "帮助", path: "#" },
  ];

  const handleClick = (path: string, key: string) => {
    if (path === "#") {
      console.log("Clicked:", key);
      return;
    }
    navigate(path);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-[60px] bottom-0 w-16 flex flex-col items-center py-5 gap-2",
        "bg-forest-950/60 backdrop-blur-xl border-r border-forest-700/40 z-40"
      )}
    >
      <nav className="flex flex-col items-center gap-1.5 flex-1">
        {items.slice(0, 3).map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.key;
          return (
            <button
              key={item.key}
              onClick={() => handleClick(item.path, item.key)}
              title={item.label}
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center group relative",
                "transition-all duration-200 ease-out",
                isActive
                  ? "bg-amber-500/15 text-amber-400"
                  : "text-slate-400 hover:bg-forest-800/60 hover:text-slate-200"
              )}
            >
              <Icon
                className="w-5 h-5 transition-transform duration-200 group-hover:scale-110"
                strokeWidth={isActive ? 2.25 : 2}
              />
              <span
                className={cn(
                  "absolute left-14 whitespace-nowrap px-2 py-1 rounded-md text-xs",
                  "bg-forest-800 text-slate-200 border border-forest-700/50",
                  "opacity-0 group-hover:opacity-100 pointer-events-none",
                  "transition-all duration-200 translate-x-[-4px] group-hover:translate-x-0"
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}

        <div className="w-8 h-px bg-forest-700/40 my-2" />

        {items.slice(3).map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => handleClick(item.path, item.key)}
              title={item.label}
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center group relative",
                "transition-all duration-200 ease-out",
                "text-slate-400 hover:bg-forest-800/60 hover:text-slate-200"
              )}
            >
              <Icon
                className="w-5 h-5 transition-transform duration-200 group-hover:scale-110"
                strokeWidth={2}
              />
              <span
                className={cn(
                  "absolute left-14 whitespace-nowrap px-2 py-1 rounded-md text-xs",
                  "bg-forest-800 text-slate-200 border border-forest-700/50",
                  "opacity-0 group-hover:opacity-100 pointer-events-none",
                  "transition-all duration-200 translate-x-[-4px] group-hover:translate-x-0"
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <button
            title="素材总数"
            className={cn(
              "w-12 h-12 rounded-xl flex flex-col items-center justify-center",
              "bg-forest-800/40 border border-forest-700/40",
              "hover:bg-forest-800/60 transition-colors duration-200"
            )}
          >
            <span className="text-[10px] text-slate-500 leading-none">
              素材
            </span>
            <span className="text-sm font-bold text-amber-400 mt-0.5">
              {recordings.length}
            </span>
          </button>
          <div
            className={cn(
              "absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center",
              "bg-amber-500/20 text-amber-400 text-[10px] font-bold",
              "border border-amber-500/30"
            )}
          >
            {recordings.length}
          </div>
        </div>
      </div>
    </aside>
  );
}
