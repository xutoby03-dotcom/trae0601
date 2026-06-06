import { useSmartHomeStore } from '@/store/useSmartHomeStore';
import { Zap, Clock, Menu, X } from 'lucide-react';
import { useState } from 'react';

export const Sidebar = () => {
  const { setShowEnergyPanel, setShowLogPanel, showEnergyPanel, showLogPanel } = useSmartHomeStore();
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-30">
      <div className="flex flex-col gap-2 p-2 bg-gray-900/80 border border-gray-700 rounded-2xl backdrop-blur-md shadow-xl">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors"
        >
          {isExpanded ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {isExpanded && (
          <>
            <div className="w-full h-px bg-gray-700 my-1" />
            
            <button
              onClick={() => setShowEnergyPanel(!showEnergyPanel)}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                showEnergyPanel
                  ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Zap className="w-5 h-5" />
              <span className="text-sm font-medium">能耗统计</span>
            </button>

            <button
              onClick={() => setShowLogPanel(!showLogPanel)}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                showLogPanel
                  ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Clock className="w-5 h-5" />
              <span className="text-sm font-medium">设备日志</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
