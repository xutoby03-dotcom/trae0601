import { Palette, Image } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const Header = () => {
  const location = useLocation();

  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-purple-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-2xl shadow-lg group-hover:animate-bounce transition-all">
            🎨
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent animate-gradient">
              Emoji Art Studio
            </h1>
            <p className="text-xs text-gray-500">用 emoji 创造你的像素艺术</p>
          </div>
        </Link>
        
        <nav className="flex items-center gap-2">
          <Link
            to="/"
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300
              ${location.pathname === '/' 
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md scale-105' 
                : 'text-gray-600 hover:bg-purple-50 hover:scale-105'
              }
            `}
          >
            <Palette className="w-4 h-4" />
            <span className="text-sm font-medium">创作</span>
          </Link>
          <Link
            to="/gallery"
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300
              ${location.pathname === '/gallery' 
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md scale-105' 
                : 'text-gray-600 hover:bg-purple-50 hover:scale-105'
              }
            `}
          >
            <Image className="w-4 h-4" />
            <span className="text-sm font-medium">画廊</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};
