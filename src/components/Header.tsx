import { Link, useLocation } from 'react-router-dom';
import { Plus, Layers, Home } from 'lucide-react';

export function Header() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="bg-[#F8F4ED] border-b border-[#8B5A3C]/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B5A3C] to-[#3D5A45] flex items-center justify-center text-white font-serif text-lg">
            T
          </div>
          <div>
            <h1 className="text-xl font-serif text-[#8B5A3C] tracking-wide group-hover:text-[#3D5A45] transition-colors">
              触感索引库
            </h1>
            <p className="text-xs text-[#8B5A3C]/60">面料质感数据库</p>
          </div>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            to="/"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              isActive('/') && !isActive('/boards') && !location.pathname.startsWith('/fabric')
                ? 'bg-[#8B5A3C]/10 text-[#8B5A3C]'
                : 'text-[#8B5A3C]/70 hover:text-[#8B5A3C] hover:bg-[#8B5A3C]/5'
            }`}
          >
            <Home size={18} />
            <span className="text-sm font-medium">面料库</span>
          </Link>

          <Link
            to="/boards"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              isActive('/boards')
                ? 'bg-[#3D5A45]/10 text-[#3D5A45]'
                : 'text-[#8B5A3C]/70 hover:text-[#8B5A3C] hover:bg-[#8B5A3C]/5'
            }`}
          >
            <Layers size={18} />
            <span className="text-sm font-medium">候选板</span>
          </Link>

          <Link
            to="/fabric/new"
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#8B5A3C] to-[#3D5A45] text-white rounded-lg hover:shadow-lg hover:shadow-[#8B5A3C]/20 transition-all transform hover:-translate-y-0.5"
          >
            <Plus size={18} />
            <span className="text-sm font-medium">新增面料</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
