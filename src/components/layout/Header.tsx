import { Bell, Search } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-tea-100 px-8 py-4 flex items-center justify-between">
      <div>
        <h2 className="font-serif text-2xl font-bold text-teaGreen-700">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索茶品、罐号..."
            className="pl-10 pr-4 py-2 w-64 rounded-lg bg-tea-50 border border-tea-100 text-sm focus:outline-none focus:border-teaGreen-300 focus:bg-white transition-colors"
          />
        </div>

        <button className="relative p-2 rounded-lg hover:bg-tea-50 transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-dangerRed rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
