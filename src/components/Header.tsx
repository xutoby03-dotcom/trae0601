import { RefreshCw, Cake } from 'lucide-react';
import { useOrderStore } from '@/store/useOrderStore';

export default function Header() {
  const orders = useOrderStore((s) => s.orders);
  const today = new Date();
  const dateStr = today.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-30 bg-cream-100/95 backdrop-blur-sm border-b border-cream-300">
      <div className="max-w-[1600px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-amber-300 flex items-center justify-center shadow-md">
              <Cake className="w-7 h-7 text-white" strokeWidth={2.2} />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-coffee-900 tracking-wide">
                后厨排单白板
              </h1>
              <p className="text-sm text-coffee-800/70 mt-0.5">{dateStr}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-cream-50 border border-cream-300">
              <span className="text-sm text-coffee-800/70">今日订单</span>
              <span className="text-lg font-bold text-coffee-900">{orders.length}</span>
              <span className="text-xs text-coffee-800/50">单</span>
            </div>

            <button
              onClick={handleRefresh}
              className="p-2.5 rounded-xl bg-cream-50 border border-cream-300 text-coffee-800 hover:bg-cream-200 hover:border-cream-300 transition-all duration-200 active:scale-95"
              aria-label="刷新"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
