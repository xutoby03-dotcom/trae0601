import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { BookOpen, Users, ClipboardCheck, BarChart3, GraduationCap } from "lucide-react";
import { CoursesPage } from "./pages/CoursesPage";
import { ApplyPage } from "./pages/ApplyPage";
import { CheckinPage } from "./pages/CheckinPage";
import { StatisticsPage } from "./pages/StatisticsPage";

const navItems = [
  { path: "/", label: "课程档案", icon: BookOpen },
  { path: "/apply", label: "旁听申请", icon: Users },
  { path: "/checkin", label: "签到管理", icon: ClipboardCheck },
  { path: "/statistics", label: "统计分析", icon: BarChart3 },
];

function Navigation() {
  const location = useLocation();

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">旁听座位安排系统</h1>
              <p className="text-xs text-slate-500">公开课 & 竞赛辅导管理</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-slate-100 text-slate-800"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<CoursesPage />} />
            <Route path="/apply" element={<ApplyPage />} />
            <Route path="/checkin" element={<CheckinPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
