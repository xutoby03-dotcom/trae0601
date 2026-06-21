import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");

  const getActiveTab = (path: string) => {
    if (path === "/map") return "map";
    if (path === "/library") return "library";
    if (path === "/projects") return "projects";
    return "map";
  };

  const activeTab = getActiveTab(location.pathname);

  const tabs = [
    { key: "map", label: "地图", icon: "🗺️", path: "/map" },
    { key: "library", label: "素材库", icon: "📚", path: "/library" },
    { key: "projects", label: "项目", icon: "📁", path: "/projects" },
  ];

  const handleTabClick = (path: string) => {
    navigate(path);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchValue);
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 h-[60px] z-50 flex items-center px-6",
        "bg-forest-900/80 backdrop-blur-xl border-b border-forest-700/50"
      )}
    >
      <div className="flex items-center gap-3 shrink-0">
        <div className="relative w-10 h-10 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-amber-400/20 animate-ping opacity-40" />
          <div className="absolute inset-1 rounded-full bg-amber-400/30" />
          <div className="relative w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shadow-lg shadow-amber-500/50" />
        </div>
        <div className="flex flex-col leading-tight">
          <h1 className="font-display text-xl text-cream tracking-wider">
            Soundscape Atlas
          </h1>
          <span className="text-xs text-forest-300/80">声景图集</span>
        </div>
      </div>

      <div className="flex-1 flex justify-center mx-8">
        <form onSubmit={handleSearch} className="w-96 relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            strokeWidth={2}
          />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="搜索地点、标签、文件名..."
            className={cn(
              "w-full h-11 pl-11 pr-4 rounded-full",
              "bg-forest-800/60 border border-forest-700",
              "text-sm text-slate-200 placeholder:text-slate-500",
              "outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20",
              "transition-all duration-200"
            )}
          />
        </form>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div
          className={cn(
            "flex items-center gap-1 p-1 rounded-xl",
            "bg-forest-800/40 border border-forest-700/50"
          )}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabClick(tab.path)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium",
                "transition-all duration-200 ease-out",
                activeTab === tab.key
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/50"
                  : "text-slate-400 hover:text-slate-200 hover:bg-forest-800/60 border border-transparent"
              )}
            >
              <span className="text-base">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="ml-4 w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-forest-600 to-moss-400 text-forest-950 font-bold text-lg shadow-lg shadow-forest-900/50 cursor-pointer hover:scale-105 transition-transform duration-200">
          S
        </div>
      </div>
    </header>
  );
}
