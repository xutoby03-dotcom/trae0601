import { useLocation, useNavigate } from "react-router-dom";
import { BookOpen, CalendarDays, BarChart3 } from "lucide-react";

const tabs = [
  { path: "/", icon: BookOpen, label: "书架" },
  { path: "/calendar", icon: CalendarDays, label: "日历" },
  { path: "/report", icon: BarChart3, label: "月报" },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-md border-t border-caramel-light/30 rounded-t-2xl shadow-warm pb-2">
      <div className="flex justify-around items-center pt-2">
        {tabs.map(({ path, icon: Icon, label }) => {
          const active = pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 ${active ? "text-caramel" : "text-warm-gray"}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
              {active && <span className="w-1 h-1 rounded-full bg-caramel" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
