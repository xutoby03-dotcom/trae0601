import { useMemo, useState } from 'react';
import { useWedding } from '../context/WeddingContext';
import { generateKitchenOrders, generateWaiterNotes, calculateSpecialMeals } from '../utils/seatingUtils';

type ViewType = 'kitchen' | 'waiter' | 'summary';

export default function KitchenOrders() {
  const { tables, guests } = useWedding();
  const [activeView, setActiveView] = useState<ViewType>('summary');

  const kitchenOrders = useMemo(() => generateKitchenOrders(tables, guests), [tables, guests]);
  const waiterNotes = useMemo(() => generateWaiterNotes(tables, guests), [tables, guests]);
  const totalSpecialMeals = useMemo(() => calculateSpecialMeals(guests), [guests]);

  const tablesWithGuests = tables.filter(t => t.guestIds.length > 0);
  const totalGuests = guests.reduce((sum, g) => sum + g.headCount, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6">
      <div className="mb-6 no-print">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-wedding-dark">厨房备餐</h2>
            <p className="text-gray-500 text-sm mt-1">
              厨房备餐清单和服务员提示，按桌统计特殊餐食和过敏原
            </p>
          </div>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-wedding-gold text-white rounded-lg hover:bg-wedding-gold/90 transition-colors font-medium"
          >
            🖨️ 打印清单
          </button>
        </div>

        <div className="flex gap-2 mt-4">
          {([
            { key: 'summary', label: '📊 总览' },
            { key: 'kitchen', label: '🍳 厨房备餐' },
            { key: 'waiter', label: '💁 服务员提示' },
          ] as { key: ViewType; label: string }[]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveView(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeView === tab.key
                  ? 'bg-wedding-rose/20 text-wedding-dark'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeView === 'summary' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-wedding-pink/20 p-4">
              <p className="text-sm text-gray-500">总宾客数</p>
              <p className="text-3xl font-bold text-wedding-dark mt-1">{totalGuests}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-wedding-pink/20 p-4">
              <p className="text-sm text-gray-500">已安排桌数</p>
              <p className="text-3xl font-bold text-wedding-dark mt-1">{tablesWithGuests.length}</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-4">
              <p className="text-sm text-orange-600">特殊餐总数</p>
              <p className="text-3xl font-bold text-orange-700 mt-1">
                {Object.values(totalSpecialMeals).reduce((a, b) => a + b, 0)}
              </p>
            </div>
            <div className="bg-red-50 rounded-xl p-4">
              <p className="text-sm text-red-600">过敏宾客</p>
              <p className="text-3xl font-bold text-red-700 mt-1">
                {guests.filter(g => g.allergens.length > 0).reduce((sum, g) => sum + g.headCount, 0)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-wedding-pink/20 p-6">
            <h3 className="font-bold text-lg text-wedding-dark mb-4">特殊餐食统计</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.entries(totalSpecialMeals).map(([key, value]) => {
                const labels: Record<string, string> = {
                  vegetarian: '🥬 素食',
                  vegan: '🥗 纯素',
                  glutenFree: '🌾 无麸质',
                  noSeafood: '🦐 无海鲜',
                  noPork: '🐷 无猪肉',
                  noBeef: '🥩 无牛肉',
                  childMeal: '🍼 儿童餐',
                  softFood: '🥣 软食',
                  other: '📝 其他',
                };
                return (
                  <div key={key} className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-wedding-dark">{value}</p>
                    <p className="text-sm text-gray-500 mt-1">{labels[key] || key}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-wedding-pink/20 p-6">
            <h3 className="font-bold text-lg text-wedding-dark mb-4">过敏原统计</h3>
            <div className="flex flex-wrap gap-3">
              {(() => {
                const allergenCount = new Map<string, number>();
                guests.forEach(g => {
                  g.allergens.forEach(a => {
                    allergenCount.set(a, (allergenCount.get(a) || 0) + g.headCount);
                  });
                });
                return Array.from(allergenCount.entries()).map(([allergen, count]) => (
                  <div key={allergen} className="bg-red-50 px-4 py-2 rounded-lg">
                    <span className="text-red-600 font-medium">{allergen}</span>
                    <span className="text-red-400 text-sm ml-2">{count}人</span>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

      {activeView === 'kitchen' && (
        <div className="space-y-4">
          {kitchenOrders.filter(o => o.totalGuests > 0).map(order => (
            <div key={order.tableId} className="bg-white rounded-xl shadow-sm border border-wedding-pink/20 overflow-hidden">
              <div className="bg-wedding-cream px-6 py-3 border-b border-wedding-pink/20">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-wedding-dark">
                    第 {order.tableNumber} 桌
                  </h3>
                  <span className="text-sm text-gray-600">{order.totalGuests} 位宾客</span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {order.specialMeals.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-orange-700 mb-2">🍽️ 特殊餐食</h4>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <div className="space-y-2">
                        {order.specialMeals.map((meal, i) => (
                          <div key={i} className="flex justify-between items-center">
                            <span className="text-gray-700">{meal.type}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-500">
                                {meal.guestNames.join('、')}
                              </span>
                              <span className="font-bold text-orange-600">{meal.count} 份</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {order.allergens.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-red-700 mb-2">⚠️ 过敏原</h4>
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="space-y-2">
                        {order.allergens.map((allergen, i) => (
                          <div key={i} className="flex justify-between items-center">
                            <span className="text-gray-700 font-medium">{allergen.allergen} 过敏</span>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-500">
                                {allergen.guestNames.join('、')}
                              </span>
                              <span className="font-bold text-red-600">{allergen.count} 人</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {order.specialMeals.length === 0 && order.allergens.length === 0 && (
                  <p className="text-gray-400 text-center py-4">无特殊要求</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeView === 'waiter' && (
        <div className="space-y-4">
          {waiterNotes.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-5xl mb-4">💁</p>
              <p>暂无需要特别关注的桌位</p>
            </div>
          ) : (
            waiterNotes.map(note => (
              <div key={note.tableId} className="bg-white rounded-xl shadow-sm border border-wedding-pink/20 p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-bold text-lg text-wedding-dark">
                    第 {note.tableNumber} 桌
                  </h3>
                  <div className="flex gap-2">
                    {note.childCount > 0 && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
                        👶 儿童 {note.childCount} 位
                      </span>
                    )}
                    {note.elderlyCount > 0 && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                        👴 老人 {note.elderlyCount} 位
                      </span>
                    )}
                  </div>
                </div>

                {note.specialAssistance.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">服务员特别提示：</h4>
                    <ul className="space-y-1">
                      {note.specialAssistance.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="text-wedding-gold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
