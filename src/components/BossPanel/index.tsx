import { useState } from 'react';
import { ChevronUp, ChevronDown, BarChart3 } from 'lucide-react';
import { useOrderStore } from '@/store/useOrderStore';
import ChefCapacity from './ChefCapacity';
import CongestionHeatmap from './CongestionHeatmap';
import RiskOrderList from './RiskOrderList';

export default function BossPanel() {
  const [isExpanded, setIsExpanded] = useState(true);
  const chefs = useOrderStore((s) => s.chefs);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      <div className={`
        bg-cream-100/98 backdrop-blur-md border-t border-cream-300
        transition-all duration-300 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]
        ${isExpanded ? 'pb-4' : 'pb-0'}
      `}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-2 py-2 text-coffee-800/70 hover:text-coffee-900 transition-colors border-b border-cream-300/60"
        >
          <BarChart3 className="w-4 h-4" />
          <span className="text-sm font-medium">老板视角 · 产能监控</span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </button>

        {isExpanded && (
          <div className="max-w-[1600px] mx-auto px-6 pt-4 animate-fade-in">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-5">
                <div className="text-xs font-bold text-coffee-900 mb-2.5 flex items-center gap-1.5">
                  <span>👨‍🍳</span>
                  <span>裱花师产能</span>
                </div>
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-2">
                  {chefs.map((chef) => (
                    <ChefCapacity key={chef.id} chef={chef} />
                  ))}
                </div>
              </div>

              <div className="col-span-4">
                <CongestionHeatmap />
              </div>

              <div className="col-span-3">
                <RiskOrderList />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
