import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package, AlertTriangle, Plus } from 'lucide-react';
import { useAppStore } from '@/store';
import SupplyCard from '@/components/SupplyCard';
import { SUPPLY_TYPE_LABELS, LOW_STOCK_THRESHOLDS } from '@/utils/constants';
import type { SupplyType } from '@/types';

const allTypes: (SupplyType | 'all')[] = [
  'all',
  'blackPen',
  'redPen',
  'bluePen',
  'eraser',
  'cleaner',
  'magnet',
];

export default function InventoryList() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { rooms, supplies, updateSupply } = useAppStore();
  const [filterType, setFilterType] = useState<SupplyType | 'all'>('all');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  const targetRoom = roomId ? rooms.find((r) => r.id === roomId) : null;
  const filteredSupplies = supplies.filter((s) => {
    const matchRoom = roomId ? s.roomId === roomId : true;
    const matchType = filterType === 'all' ? true : s.type === filterType;
    const threshold = LOW_STOCK_THRESHOLDS[s.type];
    const isLow =
      s.type === 'cleaner'
        ? (s.remainingPercent ?? 0) <= threshold
        : s.quantity <= threshold;
    const matchLowStock = onlyLowStock ? isLow : true;
    return matchRoom && matchType && matchLowStock;
  });

  const totalByType = allTypes.slice(1).reduce((acc, type) => {
    const typeSupplies = roomId
      ? supplies.filter((s) => s.roomId === roomId && s.type === type)
      : supplies.filter((s) => s.type === type);
    acc[type as SupplyType] = typeSupplies.reduce((sum, s) => sum + s.quantity, 0);
    return acc;
  }, {} as Record<SupplyType, number>);

  const handleQuantityChange = (id: string, delta: number) => {
    const supply = supplies.find((s) => s.id === id);
    if (supply) {
      const newQty = Math.max(0, supply.quantity + delta);
      updateSupply(id, { quantity: newQty });
    }
  };

  const handlePercentChange = (id: string, percent: number) => {
    updateSupply(id, { remainingPercent: Math.max(0, Math.min(100, percent)) });
  };

  return (
    <div className="space-y-6">
      {roomId && targetRoom && (
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/inventory')}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-slate-800">{targetRoom.name} - 库存详情</h2>
            <p className="text-sm text-slate-500">{targetRoom.floor}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {allTypes.slice(1).map((type) => {
          const isActive = filterType === type;
          return (
            <button
              key={type}
              onClick={() => setFilterType(isActive ? 'all' : type)}
              className={`p-4 rounded-xl text-left transition-all ${
                isActive
                  ? 'bg-primary-700 text-white shadow-lg shadow-primary-700/20'
                  : 'bg-white border border-slate-100 hover:border-primary-200'
              }`}
            >
              <p className={`text-sm ${isActive ? 'text-white/70' : 'text-slate-500'}`}>
                {SUPPLY_TYPE_LABELS[type]}
              </p>
              <p className={`text-2xl font-bold mt-1 font-mono ${isActive ? '' : 'text-slate-800'}`}>
                {totalByType[type]}
              </p>
            </button>
          );
        })}
      </div>

      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="flex gap-3 items-center">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyLowStock}
                onChange={(e) => setOnlyLowStock(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-slate-600 inline-flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-accent-500" />
                仅显示库存告警
              </span>
            </label>
          </div>
          {roomId && (
            <button
              onClick={() => navigate(`/inspection/${roomId}`)}
              className="btn btn-primary btn-sm"
            >
              <Plus className="w-4 h-4" />
              执行巡检
            </button>
          )}
        </div>
      </div>

      {filteredSupplies.length === 0 ? (
        <div className="card p-16 text-center">
          <Package className="w-16 h-16 mx-auto text-slate-200 mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">暂无匹配的用品</h3>
          <p className="text-slate-400">请尝试调整筛选条件</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSupplies.map((supply) => {
            const room = rooms.find((r) => r.id === supply.roomId);
            return (
              <div key={supply.id} className="space-y-3">
                <SupplyCard supply={supply} />
                {roomId && (
                  <div className="card p-3">
                    {supply.type === 'cleaner' ? (
                      <div>
                        <label className="text-xs text-slate-500 block mb-2">调整余量</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={supply.remainingPercent ?? 0}
                            onChange={(e) => handlePercentChange(supply.id, parseInt(e.target.value))}
                            className="flex-1 accent-primary-600"
                          />
                          <span className="text-sm font-mono font-medium text-slate-700 w-12 text-right">
                            {supply.remainingPercent}%
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="text-xs text-slate-500 block mb-2">调整数量</label>
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => handleQuantityChange(supply.id, -1)}
                            className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
                          >
                            -
                          </button>
                          <span className="text-xl font-bold text-slate-800 font-mono">
                            {supply.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(supply.id, 1)}
                            className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {!roomId && room && (
                  <p className="text-xs text-slate-400 px-1">
                    {room.floor} · {room.name}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
