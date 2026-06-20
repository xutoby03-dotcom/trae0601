import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Smartphone, Key, Shirt, RectangleHorizontal, Sun, Pill, Banknote, Check, ChevronDown, ChevronUp, User } from 'lucide-react';
import { useStore } from '@/store/useStore';
import StatusBadge from '@/components/StatusBadge';
import { itemLabels, valuableItems } from '@/types';
import type { ItemCheck } from '@/types';

const itemIcons: Record<string, any> = {
  phone: Smartphone,
  carKey: Key,
  dryClothes: Shirt,
  towel: RectangleHorizontal,
  sunscreen: Sun,
  medicine: Pill,
  cash: Banknote,
};

export default function Checklist() {
  const { bags, members, itemChecks, updateItemCheck, confirmItemCheck } = useStore();
  const [searchParams] = useSearchParams();
  const targetBagId = searchParams.get('bagId');
  const [expandedBag, setExpandedBag] = useState<string | null>(bags[0]?.id || null);
  const [highlightBagId, setHighlightBagId] = useState<string | null>(null);
  const [checkerName, setCheckerName] = useState('领队');

  useEffect(() => {
    if (targetBagId && bags.some(b => b.id === targetBagId)) {
      setExpandedBag(targetBagId);
      setHighlightBagId(targetBagId);
      const timer = setTimeout(() => setHighlightBagId(null), 2100);
      return () => clearTimeout(timer);
    }
  }, [targetBagId, bags]);

  const getOwnerName = (ownerId: string) => {
    return members.find(m => m.id === ownerId)?.name || '未知';
  };

  const getItemCheck = (bagId: string) => {
    return itemChecks.find(ic => ic.bagId === bagId);
  };

  const handleItemToggle = (bagId: string, itemKey: keyof Omit<ItemCheck, 'id' | 'bagId' | 'notes' | 'checkedAt' | 'checkedBy'>) => {
    const itemCheck = getItemCheck(bagId);
    if (itemCheck?.checkedAt) return;
    
    updateItemCheck(bagId, { [itemKey]: !itemCheck?.[itemKey] });
  };

  const handleNotesChange = (bagId: string, notes: string) => {
    const itemCheck = getItemCheck(bagId);
    if (itemCheck?.checkedAt) return;
    
    updateItemCheck(bagId, { notes });
  };

  const handleConfirm = (bagId: string) => {
    if (!checkerName.trim()) {
      alert('请输入清点人姓名');
      return;
    }
    confirmItemCheck(bagId, checkerName.trim());
  };

  const allItemKeys = Object.keys(itemLabels) as Array<keyof typeof itemLabels>;

  return (
    <div className="animate-fade-in-up">
      <div className="glass-card rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">清点人：</span>
          </div>
          <input
            type="text"
            className="input-field w-40"
            value={checkerName}
            onChange={(e) => setCheckerName(e.target.value)}
            placeholder="请输入姓名"
          />
        </div>
      </div>

      <div className="space-y-4">
        {bags.map((bag, index) => {
          const itemCheck = getItemCheck(bag.id);
          const isExpanded = expandedBag === bag.id;
          const isChecked = !!itemCheck?.checkedAt;
          const isHighlighted = highlightBagId === bag.id;
          const checkedCount = allItemKeys.filter(key => itemCheck?.[key]).length;
          const totalCount = allItemKeys.length;

          return (
            <div
              key={bag.id}
              className={`glass-card rounded-2xl overflow-hidden animate-fade-in-up ${isHighlighted ? 'animate-highlight' : ''}`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                className={`p-5 cursor-pointer transition-colors ${isChecked ? 'bg-green-50/50' : 'hover:bg-white/30'}`}
                onClick={() => setExpandedBag(isExpanded ? null : bag.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold">#{bag.number}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-800">
                          {bag.color} {bag.capacity} 防水包
                        </h3>
                        <StatusBadge status={bag.sealStatus} size="sm" />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        拥有者：{getOwnerName(bag.ownerId)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-800">
                        {checkedCount}/{totalCount}
                      </div>
                      <div className="text-xs text-gray-500">已清点物品</div>
                    </div>
                    
                    {isChecked ? (
                      <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full">
                        <Check className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-700">已确认</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full">
                        <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse-dot" />
                        <span className="text-sm font-medium text-amber-700">待清点</span>
                      </div>
                    )}
                    
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
                
                {isChecked && itemCheck && (
                  <div className="mt-3 pt-3 border-t border-green-200/50 text-sm text-green-700">
                    <span className="font-medium">确认人：</span>{itemCheck.checkedBy}
                    <span className="mx-2">·</span>
                    <span className="font-medium">时间：</span>
                    {new Date(itemCheck.checkedAt!).toLocaleString('zh-CN')}
                    {itemCheck.notes && (
                      <>
                        <span className="mx-2">·</span>
                        <span className="font-medium">备注：</span>{itemCheck.notes}
                      </>
                    )}
                  </div>
                )}
              </div>
              
              {isExpanded && itemCheck && (
                <div className="px-5 pb-5 border-t border-gray-100">
                  <div className="pt-4">
                    <h4 className="font-medium text-gray-700 mb-4">物品清单</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {allItemKeys.map((key) => {
                        const Icon = itemIcons[key];
                        const isValuable = valuableItems.includes(key);
                        const isChecked = itemCheck[key];
                        
                        return (
                          <button
                            key={key}
                            onClick={() => handleItemToggle(bag.id, key)}
                            disabled={!!itemCheck.checkedAt}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${
                              isChecked
                                ? 'border-green-400 bg-green-50'
                                : 'border-gray-200 bg-white/50 hover:border-sky-300'
                            } ${itemCheck.checkedAt ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                isChecked ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
                              }`}>
                                {isChecked ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                              </div>
                              <div>
                                <div className="flex items-center gap-1">
                                  <span className={`font-medium ${isChecked ? 'text-green-700' : 'text-gray-700'}`}>
                                    {itemLabels[key]}
                                  </span>
                                  {isValuable && (
                                    <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">
                                      贵重
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    
                    {!itemCheck.checkedAt && (
                      <div className="mt-6 space-y-4">
                        <div>
                          <label className="form-label">备注</label>
                          <textarea
                            className="input-field min-h-[80px] resize-none"
                            value={itemCheck.notes}
                            onChange={(e) => handleNotesChange(bag.id, e.target.value)}
                            placeholder="如有特殊情况请在此备注..."
                          />
                        </div>
                        
                        <button
                          onClick={() => handleConfirm(bag.id)}
                          disabled={checkedCount === 0}
                          className="btn-success w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Check className="w-5 h-5 inline mr-2" />
                          确认清点完成
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
