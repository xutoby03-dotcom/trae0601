import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { BookOpen, BookPlus, ArrowLeftRight, Gift, GraduationCap, Settings, Library } from "lucide-react";

const navItems = [
  { to: "/", icon: Library, label: "柜格总览" },
  { to: "/return", icon: ArrowLeftRight, label: "归还图书" },
  { to: "/donate", icon: Gift, label: "我要捐书" },
  { to: "/teacher", icon: GraduationCap, label: "班主任视图" },
  { to: "/admin", icon: Settings, label: "管理员" },
];

export default function Layout() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="min-h-screen bg-cream-100">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-cream-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-serif text-lg font-bold text-forest-700 leading-tight">
                  图书漂流柜
                </h1>
                <p className="text-xs text-gray-500">让好书流动起来</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200 ${
                      isActive
                        ? "bg-primary-100 text-primary-700"
                        : "text-gray-600 hover:bg-cream-200 hover:text-gray-900"
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <nav className="md:hidden flex items-center gap-1">
              {navItems.slice(0, 4).map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `p-2 rounded-lg transition-all ${
                      isActive ? "bg-primary-100 text-primary-700" : "text-gray-600"
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {isHome ? (
        <div className="bg-gradient-to-r from-forest-500 to-forest-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-2">
              📚 欢迎来到图书漂流柜
            </h2>
            <p className="text-forest-100 text-sm sm:text-base max-w-2xl">
              每一本书都是一段旅程，从一个书架漂流到另一个心灵。
              选择下方的柜格，开启你的阅读之旅吧！
            </p>
          </div>
        </div>
      ) : null}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-cream-300 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            图书漂流柜管理系统 · 让每一本书找到下一位读者
          </p>
        </div>
      </footer>
    </div>
  );
}
