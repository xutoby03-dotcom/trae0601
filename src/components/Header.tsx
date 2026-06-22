import { Calendar, MapPin, Download, RotateCcw, Database } from 'lucide-react';
import { useCheckpointStore } from '@/store/useCheckpointStore';

export default function Header() {
  const { eventName, eventDate, setEventInfo, clearAll, loadMockData } = useCheckpointStore();

  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="bg-gradient-to-r from-forest-700 via-forest-600 to-terrain-600 text-white shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <MapPin className="w-8 h-8" strokeWidth={2.5} />
            </div>
            <div>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventInfo(e.target.value, eventDate)}
                className="bg-transparent border-none text-2xl lg:text-3xl font-display font-bold outline-none focus:bg-white/10 rounded-lg px-2 py-1 transition-colors w-full lg:w-auto"
                placeholder="赛事名称"
              />
              <div className="flex items-center gap-2 mt-1 text-forest-100">
                <Calendar className="w-4 h-4" />
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventInfo(eventName, e.target.value)}
                  className="bg-transparent border-b border-white/30 text-sm outline-none focus:border-white/60 transition-colors"
                />
                <span className="text-white/60">|</span>
                <span className="text-sm">检查点布置管理系统</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadMockData}
              className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 rounded-xl transition-all duration-200 backdrop-blur-sm text-sm font-medium"
            >
              <Database className="w-4 h-4" />
              加载示例
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 rounded-xl transition-all duration-200 backdrop-blur-sm text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              导出打印
            </button>
            <button
              onClick={clearAll}
              className="flex items-center gap-2 px-4 py-2 bg-alert-red/20 hover:bg-alert-red/30 text-white rounded-xl transition-all duration-200 text-sm font-medium"
            >
              <RotateCcw className="w-4 h-4" />
              清空数据
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
