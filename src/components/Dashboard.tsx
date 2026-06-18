import { useMemo } from 'react';
import { useWedding } from '../context/WeddingContext';
import {
  getUnconfirmedGuests,
  getUnprintedTables,
  getHighRiskTables,
  getUnseatedGuests,
  calculateSpecialMeals,
  getTableGuests,
  getTableHeadCount,
} from '../utils/seatingUtils';

export default function Dashboard() {
  const { guests, tables, setActiveTab, toggleConfirmed, togglePrinted } = useWedding();

  const unconfirmedGuests = useMemo(() => getUnconfirmedGuests(guests), [guests]);
  const unprintedTables = useMemo(() => getUnprintedTables(tables), [tables]);
  const highRiskTables = useMemo(() => getHighRiskTables(tables, guests), [tables, guests]);
  const unseatedGuests = useMemo(() => getUnseatedGuests(guests), [guests]);
  const specialMeals = useMemo(() => calculateSpecialMeals(guests), [guests]);

  const totalGuests = guests.reduce((sum, g) => sum + g.headCount, 0);
  const confirmedGuests = guests.filter(g => g.confirmed).reduce((sum, g) => sum + g.headCount, 0);
  const totalTables = tables.length;
  const tablesWithGuests = tables.filter(t => t.guestIds.length > 0).length;

  const totalSpecialMeals = Object.values(specialMeals).reduce((a, b) => a + b, 0);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-wedding-dark">婚礼当天看板</h2>
        <p className="text-gray-500 text-sm mt-1">实时监控婚礼筹备进度和重要事项</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-wedding-pink/20 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-wedding-pink/30 flex items-center justify-center text-2xl">
              👥
            </div>
            <div>
              <p className="text-sm text-gray-500">总宾客数</p>
              <p className="text-2xl font-bold text-wedding-dark">{totalGuests}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            已确认 {confirmedGuests} 人 / 待确认 {totalGuests - confirmedGuests} 人
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-wedding-pink/20 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl">
              🪑
            </div>
            <div>
              <p className="text-sm text-gray-500">排桌进度</p>
              <p className="text-2xl font-bold text-wedding-dark">{tablesWithGuests}/{totalTables}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            还有 {unseatedGuests.length} 位宾客未安排
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-wedding-pink/20 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-2xl">
              🍽️
            </div>
            <div>
              <p className="text-sm text-gray-500">特殊餐食</p>
              <p className="text-2xl font-bold text-orange-600">{totalSpecialMeals}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            需要特殊照顾的餐食份数
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-wedding-pink/20 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-2xl">
              ⚠️
            </div>
            <div>
              <p className="text-sm text-gray-500">高风险桌</p>
              <p className="text-2xl font-bold text-red-600">{highRiskTables.length}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            过敏宾客集中，需重点关注
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-wedding-pink/20 overflow-hidden">
          <div className="bg-yellow-50 px-5 py-3 border-b border-yellow-100">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-yellow-800 flex items-center gap-2">
                <span>⏳</span> 待确认宾客
                <span className="px-2 py-0.5 bg-yellow-200 text-yellow-800 rounded-full text-xs">
                  {unconfirmedGuests.length}
                </span>
              </h3>
              <button
                onClick={() => setActiveTab('guests')}
                className="text-xs text-yellow-600 hover:text-yellow-800"
              >
                去管理 →
              </button>
            </div>
          </div>
          <div className="p-4 max-h-80 overflow-y-auto scrollbar-thin">
            {unconfirmedGuests.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-3xl mb-2">✅</p>
                <p className="text-sm">全部宾客已确认</p>
              </div>
            ) : (
              <div className="space-y-2">
                {unconfirmedGuests.map(guest => (
                  <div
                    key={guest.id}
                    className="flex items-center justify-between p-3 bg-yellow-50/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-yellow-100 flex items-center justify-center text-sm font-medium">
                        {guest.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">{guest.name}</p>
                        <p className="text-xs text-gray-500">{guest.relation} · {guest.headCount}人</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleConfirmed(guest.id)}
                      className="text-xs px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full hover:bg-yellow-300 transition-colors"
                    >
                      确认出席
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-wedding-pink/20 overflow-hidden">
          <div className="bg-red-50 px-5 py-3 border-b border-red-100">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-red-800 flex items-center gap-2">
                <span>🚨</span> 过敏高风险桌
                <span className="px-2 py-0.5 bg-red-200 text-red-800 rounded-full text-xs">
                  {highRiskTables.length}
                </span>
              </h3>
              <button
                onClick={() => setActiveTab('seating')}
                className="text-xs text-red-600 hover:text-red-800"
              >
                查看详情 →
              </button>
            </div>
          </div>
          <div className="p-4 max-h-80 overflow-y-auto scrollbar-thin">
            {highRiskTables.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-3xl mb-2">✅</p>
                <p className="text-sm">暂无高风险桌位</p>
              </div>
            ) : (
              <div className="space-y-3">
                {highRiskTables.map(table => {
                  const tableGuests = getTableGuests(table, guests);
                  const allergenGuests = tableGuests.filter(g => g.allergens.length > 0);
                  return (
                    <div key={table.id} className="p-3 bg-red-50/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-800">
                          {table.tableName || `第 ${table.tableNumber} 桌`}
                        </span>
                        <span className="text-sm text-red-600">
                          {getTableHeadCount(table, guests)} 人
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {allergenGuests.map(g => (
                          <span
                            key={g.id}
                            className="px-2 py-0.5 bg-white text-red-600 rounded text-xs"
                          >
                            {g.name}: {g.allergens.join('、')}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-wedding-pink/20 overflow-hidden">
          <div className="bg-blue-50 px-5 py-3 border-b border-blue-100">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-blue-800 flex items-center gap-2">
                <span>🃏</span> 待打印桌卡
                <span className="px-2 py-0.5 bg-blue-200 text-blue-800 rounded-full text-xs">
                  {unprintedTables.length}
                </span>
              </h3>
              <button
                onClick={() => setActiveTab('tableCards')}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                去打印 →
              </button>
            </div>
          </div>
          <div className="p-4 max-h-80 overflow-y-auto scrollbar-thin">
            {unprintedTables.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-3xl mb-2">✅</p>
                <p className="text-sm">全部桌卡已打印</p>
              </div>
            ) : (
              <div className="space-y-2">
                {unprintedTables.map(table => {
                  const tableGuests = getTableGuests(table, guests);
                  const specialMeals = calculateSpecialMeals(tableGuests);
                  const specialMealCount = Object.values(specialMeals).reduce((a, b) => a + b, 0);
                  const allergyCount = tableGuests.filter(g => g.allergens.length > 0).reduce((sum, g) => sum + g.headCount, 0);
                  return (
                    <div
                      key={table.id}
                      className="p-3 bg-blue-50/50 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-700">
                            {table.tableName || `第 ${table.tableNumber} 桌`}
                          </p>
                          <span className="px-1.5 py-0.5 bg-orange-500 text-white rounded text-xs font-medium">
                            待重打
                          </span>
                        </div>
                        <button
                          onClick={() => togglePrinted(table.id)}
                          className="text-xs px-3 py-1 bg-blue-200 text-blue-800 rounded-full hover:bg-blue-300 transition-colors"
                        >
                          标记已打印
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{tableGuests.length} 位宾客</span>
                        <div className="flex gap-2">
                          {specialMealCount > 0 && (
                            <span className="text-orange-600">🍽️ {specialMealCount}份特殊餐</span>
                          )}
                          {allergyCount > 0 && (
                            <span className="text-red-600">⚠️ {allergyCount}人过敏</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-wedding-pink/20 overflow-hidden">
          <div className="bg-orange-50 px-5 py-3 border-b border-orange-100">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-orange-800 flex items-center gap-2">
                <span>🍽️</span> 特殊餐分布
              </h3>
              <button
                onClick={() => setActiveTab('kitchen')}
                className="text-xs text-orange-600 hover:text-orange-800"
              >
                厨房备餐 →
              </button>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(specialMeals).map(([key, value]) => {
                if (value === 0) return null;
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
                  <div key={key} className="bg-orange-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-orange-700">{value}</p>
                    <p className="text-xs text-orange-600 mt-1">{labels[key] || key}</p>
                  </div>
                );
              })}
            </div>
            {totalSpecialMeals === 0 && (
              <div className="text-center py-8 text-gray-400">
                <p className="text-3xl mb-2">🍽️</p>
                <p className="text-sm">暂无特殊餐食需求</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
