import { Link, useLocation } from "react-router-dom";
import { Home, Gamepad2, ArrowRightLeft, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "首页", icon: Home },
  { path: "/games", label: "游戏档案", icon: Gamepad2 },
  { path: "/lend", label: "借出登记", icon: ArrowRightLeft },
  { path: "/repairs", label: "补件记录", icon: Wrench },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#1a1209] text-[#FAF3E0]">
      <nav className="sticky top-0 z-50 border-b border-[#3E2723]/60 bg-[#1a1209]/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#D4A84B] to-[#b8862d] shadow-md shadow-[#D4A84B]/20">
                <span className="text-lg">🎲</span>
              </div>
              <span className="font-serif text-xl font-bold tracking-wide text-[#D4A84B]">
                桌游借阅
              </span>
            </Link>
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.path === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-[#3E2723] text-[#D4A84B] shadow-inner"
                        : "text-[#FAF3E0]/60 hover:bg-[#3E2723]/40 hover:text-[#FAF3E0]"
                    )}
                  >
                    <Icon size={16} />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
