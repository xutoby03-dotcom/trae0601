import { NavLink } from 'react-router-dom';
import { Coffee, BookOpen, BarChart3 } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F5EFE6]/90 backdrop-blur-md border-b border-[#D4A574]/20">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4A3728] to-[#6B4F3A] flex items-center justify-center shadow-md">
              <Coffee className="w-5 h-5 text-[#F5EFE6]" />
            </div>
            <h1
              className="text-xl font-bold text-[#4A3728]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              咖啡豆笔记
            </h1>
          </div>

          <div className="flex items-center gap-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-[#4A3728] text-[#F5EFE6] shadow-md'
                    : 'text-[#6B5748] hover:bg-[#E8DFD3] hover:text-[#4A3728]'
                }`
              }
            >
              <Coffee className="w-4 h-4" />
              <span>豆库</span>
            </NavLink>
            <NavLink
              to="/brews"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-[#4A3728] text-[#F5EFE6] shadow-md'
                    : 'text-[#6B5748] hover:bg-[#E8DFD3] hover:text-[#4A3728]'
                }`
              }
            >
              <BookOpen className="w-4 h-4" />
              <span>冲煮记录</span>
            </NavLink>
            <NavLink
              to="/stats"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-[#4A3728] text-[#F5EFE6] shadow-md'
                    : 'text-[#6B5748] hover:bg-[#E8DFD3] hover:text-[#4A3728]'
                }`
              }
            >
              <BarChart3 className="w-4 h-4" />
              <span>统计</span>
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
