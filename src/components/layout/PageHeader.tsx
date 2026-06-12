import { Bell, Search, User } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-cream-200 px-8 py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-serif text-forest-700">{title}</h2>
          {subtitle && <p className="text-sm text-forest-400 mt-1">{subtitle}</p>}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-forest-400" />
            <input
              type="text"
              placeholder="搜索..."
              className="pl-9 pr-4 py-2 bg-cream-50 border border-cream-200 rounded-lg text-sm w-56 focus:outline-none focus:ring-2 focus:ring-rose-300/50 focus:border-rose-300 transition-all"
            />
          </div>
          
          <button className="relative p-2 rounded-lg hover:bg-cream-100 transition-colors">
            <Bell className="w-5 h-5 text-forest-500" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-400 rounded-full" />
          </button>
          
          <div className="flex items-center gap-3 pl-4 border-l border-cream-200">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-300 to-rose-400 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-forest-700">李店长</p>
              <p className="text-xs text-forest-400">管理员</p>
            </div>
          </div>
          
          {action && <div>{action}</div>}
        </div>
      </div>
    </header>
  );
}
