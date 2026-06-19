import { useEffect, useState } from 'react';
import { useAppStore, api } from '@/store/appStore';
import type { InventoryType } from '../../shared/types';
import {
  Armchair,
  Baby,
  Accessibility,
  UtensilsCrossed,
  Plus,
  Minus,
  MapPin,
  AlertTriangle,
  Save,
  X,
  Package,
} from 'lucide-react';

const iconMap = {
  folding: { icon: Armchair, color: 'text-night-teal-700', bg: 'bg-night-teal-100' },
  child: { icon: Baby, color: 'text-warm-orange-600', bg: 'bg-warm-orange-100' },
  wheelchair: { icon: Accessibility, color: 'text-forest', bg: 'bg-forest/15' },
  picnic: { icon: UtensilsCrossed, color: 'text-night-teal-600', bg: 'bg-cream' },
};

export default function Inventory() {
  const { inventory, fetchInventory } = useAppStore();
  const [editingType, setEditingType] = useState<InventoryType | null>(null);
  const [editStorage, setEditStorage] = useState('');

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const adjustCount = async (type: InventoryType, delta: number, currentTotal: number) => {
    const newTotal = Math.max(0, currentTotal + delta);
    await api(`/api/inventory/${type}`, {
      method: 'PUT',
      body: JSON.stringify({ total: newTotal }),
    });
    await fetchInventory();
  };

  const startEditStorage = (type: InventoryType, current: string) => {
    setEditingType(type);
    setEditStorage(current);
  };

  const saveStorage = async (type: InventoryType) => {
    if (!editStorage.trim()) return;
    await api(`/api/inventory/${type}/storage`, {
      method: 'PUT',
      body: JSON.stringify({ storage: editStorage.trim() }),
    });
    await fetchInventory();
    setEditingType(null);
  };

  const totalInventory = inventory.reduce((s, i) => s + i.total, 0);
  const lowStock = inventory.filter((i) => i.total <= i.warningThreshold);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-night-teal-800 mb-1">座椅库存</h1>
        <p className="text-night-teal-500">管理各类观影座椅和设备的库存情况</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 opacity-0 animate-fade-in-up stagger-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-night-teal-100">
              <Package size={20} className="text-night-teal-700" />
            </div>
            <p className="text-sm text-night-teal-500">库存总数</p>
          </div>
          <p className="font-display text-4xl text-night-teal-800">{totalInventory}</p>
        </div>
        <div className="card p-5 opacity-0 animate-fade-in-up stagger-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-forest/15">
              <Armchair size={20} className="text-forest" />
            </div>
            <p className="text-sm text-night-teal-500">库存类别</p>
          </div>
          <p className="font-display text-4xl text-night-teal-800">{inventory.length} 类</p>
        </div>
        <div className={`card p-5 opacity-0 animate-fade-in-up stagger-3 ${lowStock.length > 0 ? 'border-warm-orange-200 bg-warm-orange-50/30' : ''}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2.5 rounded-xl ${lowStock.length > 0 ? 'bg-warm-orange-100' : 'bg-night-teal-50'}`}>
              <AlertTriangle size={20} className={lowStock.length > 0 ? 'text-warm-orange-500' : 'text-night-teal-400'} />
            </div>
            <p className="text-sm text-night-teal-500">低库存预警</p>
          </div>
          <p className={`font-display text-4xl ${lowStock.length > 0 ? 'text-warm-orange-600' : 'text-night-teal-800'}`}>
            {lowStock.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {inventory.map((item, idx) => {
          const { icon: Icon, color, bg } = iconMap[item.type];
          const isLow = item.total <= item.warningThreshold;
          const isEditing = editingType === item.type;

          return (
            <div
              key={item.type}
              className={`card p-6 opacity-0 animate-fade-in-up stagger-${(idx % 6) + 1} ${
                isLow ? 'border-red-200 bg-red-50/20' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${bg}`}>
                    <Icon size={28} className={color} />
                  </div>
                  <div>
                    <h3 className="font-display text-xl text-night-teal-800">{item.name}</h3>
                    <p className="text-sm text-night-teal-500">预警阈值 ≤ {item.warningThreshold}</p>
                  </div>
                </div>
                {isLow && (
                  <span className="badge bg-red-500 text-white flex items-center gap-1">
                    <AlertTriangle size={12} /> 库存紧张
                  </span>
                )}
              </div>

              <div className="bg-cream/60 rounded-2xl p-5 mb-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-night-teal-500">当前库存</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => adjustCount(item.type, -10, item.total)}
                      className="w-8 h-8 rounded-lg bg-white border border-night-teal-200 text-night-teal-600 hover:bg-night-teal-50 flex items-center justify-center transition-all"
                    >
                      <Minus size={14} />
                      <span className="text-xs ml-0.5">10</span>
                    </button>
                    <button
                      onClick={() => adjustCount(item.type, -1, item.total)}
                      className="w-10 h-10 rounded-xl bg-white border-2 border-night-teal-200 text-night-teal-700 hover:bg-night-teal-50 flex items-center justify-center transition-all"
                    >
                      <Minus size={18} />
                    </button>
                    <span className={`font-display text-5xl min-w-[80px] text-center ${isLow ? 'text-red-500' : 'text-night-teal-800'}`}>
                      {item.total}
                    </span>
                    <button
                      onClick={() => adjustCount(item.type, 1, item.total)}
                      className="w-10 h-10 rounded-xl bg-night-teal-800 text-white hover:bg-night-teal-900 flex items-center justify-center transition-all"
                    >
                      <Plus size={18} />
                    </button>
                    <button
                      onClick={() => adjustCount(item.type, 10, item.total)}
                      className="w-8 h-8 rounded-lg bg-night-teal-800 text-white hover:bg-night-teal-900 flex items-center justify-center transition-all"
                    >
                      <Plus size={14} />
                      <span className="text-xs ml-0.5">10</span>
                    </button>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-white overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isLow ? 'bg-red-500' : 'bg-gradient-to-r from-night-teal-500 to-night-teal-700'
                    }`}
                    style={{ width: Math.min(100, (item.total / 200) * 100) + '%' }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-night-teal-400 shrink-0" />
                {isEditing ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={editStorage}
                      onChange={(e) => setEditStorage(e.target.value)}
                      className="input-field !py-2 text-sm"
                      autoFocus
                    />
                    <button
                      onClick={() => saveStorage(item.type)}
                      className="btn-primary !py-2 !px-3 flex items-center gap-1"
                    >
                      <Save size={14} /> 保存
                    </button>
                    <button
                      onClick={() => setEditingType(null)}
                      className="btn-ghost !p-2"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startEditStorage(item.type, item.storage)}
                    className="text-sm text-night-teal-600 hover:text-warm-orange-600 flex-1 text-left"
                  >
                    {item.storage}
                    <span className="text-xs text-night-teal-400 ml-2">（点击修改）</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
